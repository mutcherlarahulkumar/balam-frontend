package com.balam.crm.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.balam.crm.data.api.ApiService
import com.balam.crm.data.model.ActivitiesResponse
import com.balam.crm.data.model.Activity
import com.balam.crm.data.model.CashInOutResponse
import com.balam.crm.data.model.Commission
import com.balam.crm.data.model.CommissionResponse
import com.balam.crm.data.model.CommissionSummaryResponse
import com.balam.crm.data.model.CreateActivityRequest
import com.balam.crm.data.model.CreateCommissionRequest
import com.balam.crm.data.model.CreateLeadRequest
import com.balam.crm.data.model.CreateLoanRequest
import com.balam.crm.data.model.CreateSBRequest
import com.balam.crm.data.model.GSTCalculation
import com.balam.crm.data.model.Lead
import com.balam.crm.data.model.LeadsResponse
import com.balam.crm.data.model.Loan
import com.balam.crm.data.model.LoansResponse
import com.balam.crm.data.model.MarkSBPaidRequest
import com.balam.crm.data.model.SBItem
import com.balam.crm.data.model.SBResponse
import com.balam.crm.data.model.UpdateActivityRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CommissionViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<CommissionResponse>>(UiState.Loading)
    val state: StateFlow<UiState<CommissionResponse>> = _state.asStateFlow()

    private val _summaryState = MutableStateFlow<UiState<CommissionSummaryResponse>>(UiState.Loading)
    val summaryState: StateFlow<UiState<CommissionSummaryResponse>> = _summaryState.asStateFlow()

    private val _createState = MutableStateFlow<UiState<Commission>?>(null)
    val createState: StateFlow<UiState<Commission>?> = _createState.asStateFlow()

    init {
        loadSummary()
        load(null, null)
    }

    fun load(year: Int?, month: Int?) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(api.getCommission(year = year, month = month))
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun loadSummary() {
        viewModelScope.launch {
            _summaryState.value = UiState.Loading
            try {
                _summaryState.value = UiState.Success(api.getCommissionSummary())
            } catch (e: Exception) {
                _summaryState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun create(request: CreateCommissionRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.createCommission(request))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun resetCreateState() {
        _createState.value = null
    }
}

@HiltViewModel
class LoansViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<LoansResponse>>(UiState.Loading)
    val state: StateFlow<UiState<LoansResponse>> = _state.asStateFlow()

    private val _createState = MutableStateFlow<UiState<Loan>?>(null)
    val createState: StateFlow<UiState<Loan>?> = _createState.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(api.getLoans())
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun create(request: CreateLoanRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.createLoan(request))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun resetCreateState() {
        _createState.value = null
    }
}

@HiltViewModel
class SBViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<SBResponse>>(UiState.Loading)
    val state: StateFlow<UiState<SBResponse>> = _state.asStateFlow()

    private val _actionState = MutableStateFlow<UiState<SBItem>?>(null)
    val actionState: StateFlow<UiState<SBItem>?> = _actionState.asStateFlow()

    fun load(unpaidOnly: Boolean) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(api.getSB(unpaidOnly = if (unpaidOnly) true else null))
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun create(request: CreateSBRequest) {
        viewModelScope.launch {
            _actionState.value = UiState.Loading
            try {
                _actionState.value = UiState.Success(api.createSB(request))
            } catch (e: Exception) {
                _actionState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun markPaid(id: Int, request: MarkSBPaidRequest) {
        viewModelScope.launch {
            _actionState.value = UiState.Loading
            try {
                _actionState.value = UiState.Success(api.markSBPaid(id, request))
            } catch (e: Exception) {
                _actionState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun resetActionState() {
        _actionState.value = null
    }
}

@HiltViewModel
class LeadsViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<LeadsResponse>>(UiState.Loading)
    val state: StateFlow<UiState<LeadsResponse>> = _state.asStateFlow()

    private val _saveState = MutableStateFlow<UiState<Lead>?>(null)
    val saveState: StateFlow<UiState<Lead>?> = _saveState.asStateFlow()

    fun load(search: String? = null) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(api.getLeads(search = search?.takeIf { it.isNotBlank() }))
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun create(request: CreateLeadRequest) {
        viewModelScope.launch {
            _saveState.value = UiState.Loading
            try {
                _saveState.value = UiState.Success(api.createLead(request))
            } catch (e: Exception) {
                _saveState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun update(id: Int, request: CreateLeadRequest) {
        viewModelScope.launch {
            _saveState.value = UiState.Loading
            try {
                _saveState.value = UiState.Success(api.updateLead(id, request))
            } catch (e: Exception) {
                _saveState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun resetSaveState() {
        _saveState.value = null
    }
}

@HiltViewModel
class ActivitiesViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<ActivitiesResponse>>(UiState.Loading)
    val state: StateFlow<UiState<ActivitiesResponse>> = _state.asStateFlow()

    private val _actionState = MutableStateFlow<UiState<Activity>?>(null)
    val actionState: StateFlow<UiState<Activity>?> = _actionState.asStateFlow()

    fun load(todayOnly: Boolean) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(
                    if (todayOnly) api.getTodayActivities() else api.getActivities()
                )
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun create(request: CreateActivityRequest) {
        viewModelScope.launch {
            _actionState.value = UiState.Loading
            try {
                _actionState.value = UiState.Success(api.createActivity(request))
            } catch (e: Exception) {
                _actionState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun updateStatus(id: Int, status: String) {
        viewModelScope.launch {
            _actionState.value = UiState.Loading
            try {
                _actionState.value = UiState.Success(api.updateActivity(id, UpdateActivityRequest(status)))
            } catch (e: Exception) {
                _actionState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun resetActionState() {
        _actionState.value = null
    }
}

@HiltViewModel
class GSTViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<GSTCalculation>?>(null)
    val state: StateFlow<UiState<GSTCalculation>?> = _state.asStateFlow()

    fun calculate(policyNo: Int) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(api.calculateGST(policyNo))
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun reset() {
        _state.value = null
    }
}

@HiltViewModel
class ReportsViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<CashInOutResponse>>(UiState.Loading)
    val state: StateFlow<UiState<CashInOutResponse>> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(api.getCashInOut())
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }
}
