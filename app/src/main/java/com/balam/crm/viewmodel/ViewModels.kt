package com.balam.crm.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.balam.crm.data.api.ApiService
import com.balam.crm.data.api.TokenStore
import com.balam.crm.data.model.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// ── UiState ───────────────────────────────────────────────────────────────────

sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

fun Throwable.toMessage(): String = message ?: "An unexpected error occurred"

// ── Auth ViewModel ────────────────────────────────────────────────────────────

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val api: ApiService,
    val tokenStore: TokenStore
) : ViewModel() {

    private val _loginState = MutableStateFlow<UiState<AuthResponse>>(UiState.Idle)
    val loginState: StateFlow<UiState<AuthResponse>> = _loginState

    private val _registerState = MutableStateFlow<UiState<MessageResponse>>(UiState.Idle)
    val registerState: StateFlow<UiState<MessageResponse>> = _registerState

    private val _profileState = MutableStateFlow<UiState<Agent>>(UiState.Idle)
    val profileState: StateFlow<UiState<Agent>> = _profileState

    private val _changePasswordState = MutableStateFlow<UiState<MessageResponse>>(UiState.Idle)
    val changePasswordState: StateFlow<UiState<MessageResponse>> = _changePasswordState

    fun login(agentCode: String, password: String) {
        viewModelScope.launch {
            _loginState.value = UiState.Loading
            try {
                val res = api.login(LoginRequest(identifier = agentCode, password = password))
                tokenStore.saveToken(res.token)
                tokenStore.saveAgent(res.agent)
                _loginState.value = UiState.Success(res)
            } catch (e: Exception) {
                _loginState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun register(req: RegisterRequest) {
        viewModelScope.launch {
            _registerState.value = UiState.Loading
            try {
                val res = api.register(req)
                _registerState.value = UiState.Success(res)
            } catch (e: Exception) {
                _registerState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun updateProfile(req: UpdateProfileRequest) {
        viewModelScope.launch {
            _profileState.value = UiState.Loading
            try {
                val agent = api.updateProfile(req)
                tokenStore.saveAgent(agent)
                _profileState.value = UiState.Success(agent)
            } catch (e: Exception) {
                _profileState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun changePassword(current: String, newPass: String) {
        viewModelScope.launch {
            _changePasswordState.value = UiState.Loading
            try {
                val res = api.changePassword(ChangePasswordRequest(current, newPass))
                _changePasswordState.value = UiState.Success(res)
            } catch (e: Exception) {
                _changePasswordState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun resetLoginState() { _loginState.value = UiState.Idle }
    fun resetRegisterState() { _registerState.value = UiState.Idle }
    fun resetPasswordState() { _changePasswordState.value = UiState.Idle }
}

// ── Policies ViewModel ────────────────────────────────────────────────────────

@HiltViewModel
class PoliciesViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _policies = MutableStateFlow<UiState<PoliciesResponse>>(UiState.Idle)
    val policies: StateFlow<UiState<PoliciesResponse>> = _policies

    private val _policyDetail = MutableStateFlow<UiState<PolicyDetail>>(UiState.Idle)
    val policyDetail: StateFlow<UiState<PolicyDetail>> = _policyDetail

    var search = MutableStateFlow("")
    var statusFilter = MutableStateFlow<String?>(null)

    fun loadPolicies(page: Int = 1) {
        viewModelScope.launch {
            _policies.value = UiState.Loading
            try {
                val res = api.getPolicies(
                    page = page,
                    search = search.value.ifBlank { null },
                    status = statusFilter.value
                )
                _policies.value = UiState.Success(res)
            } catch (e: Exception) {
                _policies.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun loadPolicyDetail(policyNo: Int) {
        viewModelScope.launch {
            _policyDetail.value = UiState.Loading
            try {
                _policyDetail.value = UiState.Success(api.getPolicyDetail(policyNo))
            } catch (e: Exception) {
                _policyDetail.value = UiState.Error(e.toMessage())
            }
        }
    }
}

// ── Families ViewModel ────────────────────────────────────────────────────────

@HiltViewModel
class FamiliesViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _families = MutableStateFlow<UiState<FamiliesResponse>>(UiState.Idle)
    val families: StateFlow<UiState<FamiliesResponse>> = _families

    private val _familyDetail = MutableStateFlow<UiState<FamilyDetail>>(UiState.Idle)
    val familyDetail: StateFlow<UiState<FamilyDetail>> = _familyDetail

    private val _createState = MutableStateFlow<UiState<CreateFamilyResponse>>(UiState.Idle)
    val createState: StateFlow<UiState<CreateFamilyResponse>> = _createState

    fun loadFamilies(search: String? = null, page: Int = 1) {
        viewModelScope.launch {
            _families.value = UiState.Loading
            try {
                _families.value = UiState.Success(api.getFamilies(search = search?.ifBlank { null }, page = page))
            } catch (e: Exception) {
                _families.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun loadFamilyDetail(familyCode: String) {
        viewModelScope.launch {
            _familyDetail.value = UiState.Loading
            try {
                _familyDetail.value = UiState.Success(api.getFamilyDetail(familyCode))
            } catch (e: Exception) {
                _familyDetail.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun createFamily(req: CreateFamilyRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.createFamily(req))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun updateFamily(familyCode: String, req: CreateFamilyRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                api.updateFamily(familyCode, req)
                _createState.value = UiState.Success(CreateFamilyResponse("Updated", familyCode))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun resetCreateState() { _createState.value = UiState.Idle }
}

// ── Clients ViewModel ─────────────────────────────────────────────────────────

@HiltViewModel
class ClientsViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _clients = MutableStateFlow<UiState<ClientsResponse>>(UiState.Idle)
    val clients: StateFlow<UiState<ClientsResponse>> = _clients

    private val _clientDetail = MutableStateFlow<UiState<ClientDetail>>(UiState.Idle)
    val clientDetail: StateFlow<UiState<ClientDetail>> = _clientDetail

    private val _createState = MutableStateFlow<UiState<Client>>(UiState.Idle)
    val createState: StateFlow<UiState<Client>> = _createState

    fun loadClients(search: String? = null, familyCode: String? = null, page: Int = 1) {
        viewModelScope.launch {
            _clients.value = UiState.Loading
            try {
                _clients.value = UiState.Success(
                    api.getClients(search = search?.ifBlank { null }, familyCode = familyCode, page = page)
                )
            } catch (e: Exception) {
                _clients.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun loadClientDetail(id: Int) {
        viewModelScope.launch {
            _clientDetail.value = UiState.Loading
            try {
                _clientDetail.value = UiState.Success(api.getClientDetail(id))
            } catch (e: Exception) {
                _clientDetail.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun createClient(req: CreateClientRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.createClient(req))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun updateClient(id: String, req: CreateClientRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.updateClient(id, req))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun resetCreateState() { _createState.value = UiState.Idle }
}

// ── FUP ViewModel ─────────────────────────────────────────────────────────────

@HiltViewModel
class FUPViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _fupList = MutableStateFlow<UiState<FUPResponse>>(UiState.Idle)
    val fupList: StateFlow<UiState<FUPResponse>> = _fupList

    private val _updateState = MutableStateFlow<UiState<MessageResponse>>(UiState.Idle)
    val updateState: StateFlow<UiState<MessageResponse>> = _updateState

    fun loadFUP(page: Int = 1) {
        viewModelScope.launch {
            _fupList.value = UiState.Loading
            try {
                _fupList.value = UiState.Success(api.getFUPDue(page = page))
            } catch (e: Exception) {
                _fupList.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun updateFUP(req: FUPUpdateRequest) {
        viewModelScope.launch {
            _updateState.value = UiState.Loading
            try {
                _updateState.value = UiState.Success(api.updateFUP(req))
            } catch (e: Exception) {
                _updateState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun resetUpdateState() { _updateState.value = UiState.Idle }
}

// ── Commission ViewModel ──────────────────────────────────────────────────────

@HiltViewModel
class CommissionViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _commissions = MutableStateFlow<UiState<CommissionResponse>>(UiState.Idle)
    val commissions: StateFlow<UiState<CommissionResponse>> = _commissions

    private val _summary = MutableStateFlow<UiState<CommissionSummaryResponse>>(UiState.Idle)
    val summary: StateFlow<UiState<CommissionSummaryResponse>> = _summary

    private val _createState = MutableStateFlow<UiState<Commission>>(UiState.Idle)
    val createState: StateFlow<UiState<Commission>> = _createState

    fun load(year: Int? = null, month: Int? = null) {
        viewModelScope.launch {
            _commissions.value = UiState.Loading
            _summary.value = UiState.Loading
            try {
                _commissions.value = UiState.Success(api.getCommissions(year, month))
            } catch (e: Exception) {
                _commissions.value = UiState.Error(e.toMessage())
            }
            try {
                _summary.value = UiState.Success(api.getCommissionSummary())
            } catch (e: Exception) {
                _summary.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun createCommission(req: CreateCommissionRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.createCommission(req))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun resetCreateState() { _createState.value = UiState.Idle }
}

// ── Loans ViewModel ───────────────────────────────────────────────────────────

@HiltViewModel
class LoansViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _loans = MutableStateFlow<UiState<LoansResponse>>(UiState.Idle)
    val loans: StateFlow<UiState<LoansResponse>> = _loans

    private val _createState = MutableStateFlow<UiState<Loan>>(UiState.Idle)
    val createState: StateFlow<UiState<Loan>> = _createState

    fun load(policyNo: Int? = null) {
        viewModelScope.launch {
            _loans.value = UiState.Loading
            try {
                _loans.value = UiState.Success(api.getLoans(policyNo))
            } catch (e: Exception) {
                _loans.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun createLoan(req: CreateLoanRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.createLoan(req))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun resetCreateState() { _createState.value = UiState.Idle }
}

// ── SB ViewModel ──────────────────────────────────────────────────────────────

@HiltViewModel
class SBViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _sbList = MutableStateFlow<UiState<SBResponse>>(UiState.Idle)
    val sbList: StateFlow<UiState<SBResponse>> = _sbList

    private val _createState = MutableStateFlow<UiState<SBItem>>(UiState.Idle)
    val createState: StateFlow<UiState<SBItem>> = _createState

    fun load(unpaidOnly: Boolean? = null) {
        viewModelScope.launch {
            _sbList.value = UiState.Loading
            try {
                _sbList.value = UiState.Success(api.getSB(unpaidOnly = unpaidOnly))
            } catch (e: Exception) {
                _sbList.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun createSB(req: CreateSBRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.createSB(req))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun markPaid(id: String, paidDate: String, chequeNo: String?) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.markSBPaid(id, MarkSBPaidRequest(paidDate, chequeNo)))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun resetCreateState() { _createState.value = UiState.Idle }
}

// ── Leads ViewModel ───────────────────────────────────────────────────────────

@HiltViewModel
class LeadsViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _leads = MutableStateFlow<UiState<LeadsResponse>>(UiState.Idle)
    val leads: StateFlow<UiState<LeadsResponse>> = _leads

    private val _createState = MutableStateFlow<UiState<Lead>>(UiState.Idle)
    val createState: StateFlow<UiState<Lead>> = _createState

    fun load(search: String? = null) {
        viewModelScope.launch {
            _leads.value = UiState.Loading
            try {
                _leads.value = UiState.Success(api.getLeads(search?.ifBlank { null }))
            } catch (e: Exception) {
                _leads.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun createLead(req: CreateLeadRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.createLead(req))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun updateLead(id: String, req: CreateLeadRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.updateLead(id, req))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun resetCreateState() { _createState.value = UiState.Idle }
}

// ── Activities ViewModel ──────────────────────────────────────────────────────

@HiltViewModel
class ActivitiesViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _activities = MutableStateFlow<UiState<ActivitiesResponse>>(UiState.Idle)
    val activities: StateFlow<UiState<ActivitiesResponse>> = _activities

    private val _todayActivities = MutableStateFlow<UiState<ActivitiesResponse>>(UiState.Idle)
    val todayActivities: StateFlow<UiState<ActivitiesResponse>> = _todayActivities

    private val _createState = MutableStateFlow<UiState<Activity>>(UiState.Idle)
    val createState: StateFlow<UiState<Activity>> = _createState

    fun load(type: String? = null, status: String? = null) {
        viewModelScope.launch {
            _activities.value = UiState.Loading
            try {
                _activities.value = UiState.Success(api.getActivities(type, status))
            } catch (e: Exception) {
                _activities.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun loadToday() {
        viewModelScope.launch {
            _todayActivities.value = UiState.Loading
            try {
                _todayActivities.value = UiState.Success(api.getTodayActivities())
            } catch (e: Exception) {
                _todayActivities.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun createActivity(req: CreateActivityRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.createActivity(req))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun updateActivity(id: String, status: String) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.updateActivity(id, UpdateActivityRequest(status)))
            } catch (e: Exception) {
                _createState.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun resetCreateState() { _createState.value = UiState.Idle }
}

// ── GST ViewModel ─────────────────────────────────────────────────────────────

@HiltViewModel
class GSTViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _gst = MutableStateFlow<UiState<GSTCalculation>>(UiState.Idle)
    val gst: StateFlow<UiState<GSTCalculation>> = _gst

    fun calculate(policyNo: Long) {
        viewModelScope.launch {
            _gst.value = UiState.Loading
            try {
                _gst.value = UiState.Success(api.calculateGST(policyNo))
            } catch (e: Exception) {
                _gst.value = UiState.Error(e.toMessage())
            }
        }
    }

    fun reset() { _gst.value = UiState.Idle }
}

// ── Reports ViewModel ─────────────────────────────────────────────────────────

@HiltViewModel
class ReportsViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _cashInOut = MutableStateFlow<UiState<CashInOutResponse>>(UiState.Idle)
    val cashInOut: StateFlow<UiState<CashInOutResponse>> = _cashInOut

    fun load() {
        viewModelScope.launch {
            _cashInOut.value = UiState.Loading
            try {
                _cashInOut.value = UiState.Success(api.getCashInOut())
            } catch (e: Exception) {
                _cashInOut.value = UiState.Error(e.toMessage())
            }
        }
    }
}

// ── Dashboard ViewModel ───────────────────────────────────────────────────────

data class DashboardData(
    val fupDue: FUPResponse?,
    val policies: PoliciesResponse?,
    val todayActivities: ActivitiesResponse?,
    val commissionSummary: CommissionSummaryResponse?
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val api: ApiService,
    val tokenStore: TokenStore
) : ViewModel() {

    private val _dashboardState = MutableStateFlow<UiState<DashboardData>>(UiState.Idle)
    val dashboardState: StateFlow<UiState<DashboardData>> = _dashboardState

    fun load() {
        viewModelScope.launch {
            _dashboardState.value = UiState.Loading
            try {
                val fup = try { api.getFUPDue(limit = 5) } catch (e: Exception) { null }
                val policies = try { api.getPolicies(limit = 5) } catch (e: Exception) { null }
                val activities = try { api.getTodayActivities() } catch (e: Exception) { null }
                val commSummary = try { api.getCommissionSummary() } catch (e: Exception) { null }
                _dashboardState.value = UiState.Success(DashboardData(fup, policies, activities, commSummary))
            } catch (e: Exception) {
                _dashboardState.value = UiState.Error(e.toMessage())
            }
        }
    }
}
