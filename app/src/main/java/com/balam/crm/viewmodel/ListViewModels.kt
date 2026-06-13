package com.balam.crm.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.balam.crm.data.api.ApiService
import com.balam.crm.data.model.Client
import com.balam.crm.data.model.ClientDetail
import com.balam.crm.data.model.ClientsResponse
import com.balam.crm.data.model.CreateClientRequest
import com.balam.crm.data.model.CreateFamilyRequest
import com.balam.crm.data.model.CreateFamilyResponse
import com.balam.crm.data.model.CreatePolicyRequest
import com.balam.crm.data.model.UpdatePolicyRequest
import com.balam.crm.data.model.FUPResponse
import com.balam.crm.data.model.FUPUpdateRequest
import com.balam.crm.data.model.FamiliesResponse
import com.balam.crm.data.model.FamilyDetail
import com.balam.crm.data.model.MessageResponse
import com.balam.crm.data.model.Plan
import com.balam.crm.data.model.PoliciesResponse
import com.balam.crm.data.model.PolicyDetail
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PoliciesViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<PoliciesResponse>>(UiState.Loading)
    val state: StateFlow<UiState<PoliciesResponse>> = _state.asStateFlow()

    private val _createState = MutableStateFlow<UiState<MessageResponse>?>(null)
    val createState: StateFlow<UiState<MessageResponse>?> = _createState.asStateFlow()

    private val _plans = MutableStateFlow<List<Plan>>(emptyList())
    val plans: StateFlow<List<Plan>> = _plans.asStateFlow()

    fun loadPlans() {
        viewModelScope.launch {
            try {
                _plans.value = api.getPlans().data
            } catch (e: Exception) {
                // keep empty; picker falls back to text
            }
        }
    }

    fun load(search: String? = null, status: String? = null) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(
                    api.getPolicies(page = 1, limit = 100, search = search?.takeIf { it.isNotBlank() }, status = status)
                )
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun createPolicy(request: CreatePolicyRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.createPolicy(request))
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
class PolicyDetailViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<PolicyDetail>>(UiState.Loading)
    val state: StateFlow<UiState<PolicyDetail>> = _state.asStateFlow()

    private val _updateState = MutableStateFlow<UiState<MessageResponse>?>(null)
    val updateState: StateFlow<UiState<MessageResponse>?> = _updateState.asStateFlow()

    fun load(policyNo: Int) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(api.getPolicy(policyNo))
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun updatePolicy(policyNo: Int, request: UpdatePolicyRequest) {
        viewModelScope.launch {
            _updateState.value = UiState.Loading
            try {
                _updateState.value = UiState.Success(api.updatePolicy(policyNo, request))
            } catch (e: Exception) {
                _updateState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun resetUpdateState() {
        _updateState.value = null
    }
}

@HiltViewModel
class FUPViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<FUPResponse>>(UiState.Loading)
    val state: StateFlow<UiState<FUPResponse>> = _state.asStateFlow()

    private val _updateState = MutableStateFlow<UiState<MessageResponse>?>(null)
    val updateState: StateFlow<UiState<MessageResponse>?> = _updateState.asStateFlow()

    init {
        load()
    }

    fun load(year: Int? = null, month: Int? = null, overdueDays: Int? = null) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(api.getFupDue(year, month, overdueDays))
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun updateFup(request: FUPUpdateRequest) {
        viewModelScope.launch {
            _updateState.value = UiState.Loading
            try {
                _updateState.value = UiState.Success(api.updateFup(request))
            } catch (e: Exception) {
                _updateState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun resetUpdateState() {
        _updateState.value = null
    }
}

@HiltViewModel
class FamiliesViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<FamiliesResponse>>(UiState.Loading)
    val state: StateFlow<UiState<FamiliesResponse>> = _state.asStateFlow()

    private val _createState = MutableStateFlow<UiState<CreateFamilyResponse>?>(null)
    val createState: StateFlow<UiState<CreateFamilyResponse>?> = _createState.asStateFlow()

    fun load(search: String? = null) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(
                    api.getFamilies(search = search?.takeIf { it.isNotBlank() }, page = 1, limit = 100)
                )
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun createFamily(request: CreateFamilyRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.createFamily(request))
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
class FamilyDetailViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<FamilyDetail>>(UiState.Loading)
    val state: StateFlow<UiState<FamilyDetail>> = _state.asStateFlow()

    fun load(familyCode: String) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(api.getFamily(familyCode))
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }
}

@HiltViewModel
class ClientsViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<ClientsResponse>>(UiState.Loading)
    val state: StateFlow<UiState<ClientsResponse>> = _state.asStateFlow()

    private val _createState = MutableStateFlow<UiState<Client>?>(null)
    val createState: StateFlow<UiState<Client>?> = _createState.asStateFlow()

    fun load(search: String? = null) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(
                    api.getClients(search = search?.takeIf { it.isNotBlank() }, page = 1, limit = 100)
                )
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun createClient(request: CreateClientRequest) {
        viewModelScope.launch {
            _createState.value = UiState.Loading
            try {
                _createState.value = UiState.Success(api.createClient(request))
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
class ClientDetailViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow<UiState<ClientDetail>>(UiState.Loading)
    val state: StateFlow<UiState<ClientDetail>> = _state.asStateFlow()

    fun load(id: Int) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Success(api.getClient(id))
            } catch (e: Exception) {
                _state.value = UiState.Error(e.friendlyMessage())
            }
        }
    }
}
