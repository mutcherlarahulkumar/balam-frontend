package com.balam.crm.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.balam.crm.data.api.ApiService
import com.balam.crm.data.api.TokenStore
import com.balam.crm.data.model.FUPDueItem
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
    val urgentFups: List<FUPDueItem>
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
                coroutineScope {
                    val policiesDeferred = async { api.getPolicies(page = 1, limit = 1) }
                    val fupDeferred = async { api.getFupDue(page = 1, limit = 5) }
                    val summaryDeferred = async {
                        try {
                            api.getCommissionSummary()
                        } catch (e: Exception) {
                            null
                        }
                    }
                    val policies = policiesDeferred.await()
                    val fup = fupDeferred.await()
                    val summary = summaryDeferred.await()
                    val agentName = tokenStore.getAgent()?.name ?: "Agent"
                    _state.value = UiState.Success(
                        DashboardData(
                            agentName = agentName,
                            policyCount = policies.total,
                            fupDueCount = fup.total,
                            monthCommission = summary?.currentMonth?.totalCommission ?: 0.0,
                            monthLabel = summary?.currentMonth?.month ?: "This month",
                            urgentFups = fup.data.take(5)
                        )
                    )
                }
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }
}
