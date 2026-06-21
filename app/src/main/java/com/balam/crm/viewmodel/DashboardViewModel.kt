package com.balam.crm.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.balam.crm.data.api.ApiService
import com.balam.crm.data.api.TokenStore
import com.balam.crm.data.model.Activity
import com.balam.crm.data.model.FUPDueItem
import com.balam.crm.data.model.Lead
import com.balam.crm.data.model.PolicyListItem
import com.balam.crm.data.model.SBItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DashboardData(
    val agentName: String,
    val policyCount: Int,
    val fupDueCount: Int,
    val monthCommission: Double,
    val monthLabel: String,
    val urgentFups: List<FUPDueItem>,
    val todayActivities: List<Activity>,
    val unpaidSBCount: Int,
    val unpaidSBPreview: List<SBItem>,
    val leadsCount: Int,
    val leadsPreview: List<Lead>,
    val lapsingPoliciesCount: Int,
    val lapsingPoliciesPreview: List<PolicyListItem>
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val api: ApiService,
    private val tokenStore: TokenStore
) : ViewModel() {

    private val _state = MutableStateFlow<UiState<DashboardData>>(UiState.Loading)
    val state: StateFlow<UiState<DashboardData>> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                val (dashboard, policyTotal) = coroutineScope {
                    val dashboardDeferred = async { api.getDashboard() }
                    val policiesDeferred = async { api.getPolicies(page = 1, limit = 1) }
                    dashboardDeferred.await() to policiesDeferred.await().total
                }
                val agentName = tokenStore.getAgent()?.name ?: "Agent"
                _state.value = UiState.Success(
                    DashboardData(
                        agentName = agentName,
                        policyCount = policyTotal,
                        fupDueCount = dashboard.duePremiums.total,
                        monthCommission = dashboard.commissionThisMonth?.totalCommission ?: 0.0,
                        monthLabel = dashboard.commissionThisMonth?.month ?: "This month",
                        urgentFups = dashboard.duePremiums.preview.take(5),
                        todayActivities = dashboard.todayActivities,
                        unpaidSBCount = dashboard.unpaidSB.total,
                        unpaidSBPreview = dashboard.unpaidSB.preview,
                        leadsCount = dashboard.leads.total,
                        leadsPreview = dashboard.leads.preview,
                        lapsingPoliciesCount = dashboard.lapsingPolicies.total,
                        lapsingPoliciesPreview = dashboard.lapsingPolicies.preview
                    )
                )
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }
}
