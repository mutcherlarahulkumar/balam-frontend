package com.balam.crm.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.balam.crm.data.api.ApiService
import com.balam.crm.data.api.TokenStore
import com.balam.crm.data.model.Agent
import com.balam.crm.data.model.AuthResponse
import com.balam.crm.data.model.ChangePasswordRequest
import com.balam.crm.data.model.LoginRequest
import com.balam.crm.data.model.MessageResponse
import com.balam.crm.data.model.RegisterRequest
import com.balam.crm.data.model.UpdateProfileRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val api: ApiService,
    private val tokenStore: TokenStore
) : ViewModel() {

    private val _loginState = MutableStateFlow<UiState<AuthResponse>?>(null)
    val loginState: StateFlow<UiState<AuthResponse>?> = _loginState.asStateFlow()

    private val _registerState = MutableStateFlow<UiState<MessageResponse>?>(null)
    val registerState: StateFlow<UiState<MessageResponse>?> = _registerState.asStateFlow()

    fun login(identifier: String, password: String) {
        viewModelScope.launch {
            _loginState.value = UiState.Loading
            try {
                val response = api.login(LoginRequest(identifier = identifier, password = password))
                tokenStore.saveToken(response.token)
                tokenStore.saveAgent(response.agent)
                _loginState.value = UiState.Success(response)
            } catch (e: Exception) {
                _loginState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun register(request: RegisterRequest) {
        viewModelScope.launch {
            _registerState.value = UiState.Loading
            try {
                _registerState.value = UiState.Success(api.register(request))
            } catch (e: Exception) {
                _registerState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun resetLoginState() {
        _loginState.value = null
    }

    fun resetRegisterState() {
        _registerState.value = null
    }
}

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val api: ApiService,
    private val tokenStore: TokenStore
) : ViewModel() {

    private val _state = MutableStateFlow<UiState<Agent>>(UiState.Loading)
    val state: StateFlow<UiState<Agent>> = _state.asStateFlow()

    private val _updateState = MutableStateFlow<UiState<Agent>?>(null)
    val updateState: StateFlow<UiState<Agent>?> = _updateState.asStateFlow()

    private val _passwordState = MutableStateFlow<UiState<MessageResponse>?>(null)
    val passwordState: StateFlow<UiState<MessageResponse>?> = _passwordState.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                val agent = api.me()
                tokenStore.saveAgent(agent)
                _state.value = UiState.Success(agent)
            } catch (e: Exception) {
                val cached = tokenStore.getAgent()
                if (cached != null) {
                    _state.value = UiState.Success(cached)
                } else {
                    _state.value = UiState.Error(e.friendlyMessage())
                }
            }
        }
    }

    fun updateProfile(request: UpdateProfileRequest) {
        viewModelScope.launch {
            _updateState.value = UiState.Loading
            try {
                val agent = api.updateProfile(request)
                tokenStore.saveAgent(agent)
                _state.value = UiState.Success(agent)
                _updateState.value = UiState.Success(agent)
            } catch (e: Exception) {
                _updateState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun changePassword(currentPassword: String, newPassword: String) {
        viewModelScope.launch {
            _passwordState.value = UiState.Loading
            try {
                _passwordState.value =
                    UiState.Success(api.changePassword(ChangePasswordRequest(currentPassword, newPassword)))
            } catch (e: Exception) {
                _passwordState.value = UiState.Error(e.friendlyMessage())
            }
        }
    }

    fun resetUpdateState() {
        _updateState.value = null
    }

    fun resetPasswordState() {
        _passwordState.value = null
    }

    fun logout() {
        tokenStore.clear()
    }
}
