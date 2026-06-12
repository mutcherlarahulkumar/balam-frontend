package com.balam.crm.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.Agent
import com.balam.crm.data.model.UpdateProfileRequest
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.InfoRow
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SectionCard
import com.balam.crm.viewmodel.ProfileViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun ProfileScreen(
    onBack: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val updateState by viewModel.updateState.collectAsStateWithLifecycle()
    val passwordState by viewModel.passwordState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    var showEditDialog by rememberSaveable { mutableStateOf(false) }
    var showPasswordDialog by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(updateState) {
        if (updateState is UiState.Success) {
            showEditDialog = false
            viewModel.resetUpdateState()
            snackbarHostState.showSnackbar("Profile updated")
        }
    }

    LaunchedEffect(passwordState) {
        if (passwordState is UiState.Success) {
            showPasswordDialog = false
            viewModel.resetPasswordState()
            snackbarHostState.showSnackbar("Password changed")
        }
    }

    Scaffold(
        topBar = { BackTopBar(title = "Profile", onBack = onBack) },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        when (val s = state) {
            is UiState.Loading -> LoadingState(modifier = Modifier.padding(padding))
            is UiState.Error -> ErrorState(
                message = s.message,
                onRetry = { viewModel.load() },
                modifier = Modifier.padding(padding)
            )
            is UiState.Success -> {
                val agent = s.data
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .background(MaterialTheme.colorScheme.primary, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = agent.name.take(1).uppercase(),
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                    Spacer(Modifier.height(12.dp))
                    Text(
                        text = agent.name,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Agent ${agent.agentCode}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    if (!agent.slogan.isNullOrBlank()) {
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = "“${agent.slogan}”",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    Spacer(Modifier.height(20.dp))

                    SectionCard(title = "Contact") {
                        InfoRow("Mobile", agent.mobile)
                        InfoRow("Email", agent.email)
                    }
                    Spacer(Modifier.height(12.dp))
                    SectionCard(title = "Agency") {
                        InfoRow("Branch", agent.branch)
                        InfoRow("Club", agent.club)
                        InfoRow("Licence No", agent.licenceNo)
                        InfoRow("Agent Since", formatDate(agent.agSince))
                        InfoRow("Renewal Date", formatDate(agent.renewalDate))
                        InfoRow("PAN", agent.pan)
                    }
                    Spacer(Modifier.height(20.dp))

                    Button(
                        onClick = { showEditDialog = true },
                        modifier = Modifier.fillMaxWidth().height(50.dp)
                    ) {
                        Icon(Icons.Filled.Edit, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.size(8.dp))
                        Text("Edit Profile")
                    }
                    Spacer(Modifier.height(10.dp))
                    OutlinedButton(
                        onClick = { showPasswordDialog = true },
                        modifier = Modifier.fillMaxWidth().height(50.dp)
                    ) {
                        Icon(Icons.Filled.Lock, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.size(8.dp))
                        Text("Change Password")
                    }
                    Spacer(Modifier.height(16.dp))
                }

                if (showEditDialog) {
                    EditProfileDialog(
                        agent = agent,
                        updateState = updateState,
                        onDismiss = {
                            showEditDialog = false
                            viewModel.resetUpdateState()
                        },
                        onSubmit = { viewModel.updateProfile(it) }
                    )
                }
            }
        }
    }

    if (showPasswordDialog) {
        ChangePasswordDialog(
            passwordState = passwordState,
            onDismiss = {
                showPasswordDialog = false
                viewModel.resetPasswordState()
            },
            onSubmit = { current, new -> viewModel.changePassword(current, new) }
        )
    }
}

@Composable
private fun EditProfileDialog(
    agent: Agent,
    updateState: UiState<*>?,
    onDismiss: () -> Unit,
    onSubmit: (UpdateProfileRequest) -> Unit
) {
    var name by remember { mutableStateOf(agent.name) }
    var mobile by remember { mutableStateOf(agent.mobile) }
    var email by remember { mutableStateOf(agent.email ?: "") }
    var slogan by remember { mutableStateOf(agent.slogan ?: "") }
    val isLoading = updateState is UiState.Loading
    val errorMessage = (updateState as? UiState.Error)?.message

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("Edit Profile") },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Name *") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = mobile,
                    onValueChange = { mobile = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Mobile *") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Email") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = slogan,
                    onValueChange = { slogan = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Slogan") },
                    singleLine = true,
                    enabled = !isLoading
                )
                if (errorMessage != null) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = errorMessage,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSubmit(
                        UpdateProfileRequest(
                            name = name.trim(),
                            mobile = mobile.trim(),
                            email = email.trim().takeIf { it.isNotBlank() },
                            slogan = slogan.trim().takeIf { it.isNotBlank() }
                        )
                    )
                },
                enabled = name.isNotBlank() && mobile.isNotBlank() && !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                } else {
                    Text("Save")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, enabled = !isLoading) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun ChangePasswordDialog(
    passwordState: UiState<*>?,
    onDismiss: () -> Unit,
    onSubmit: (current: String, new: String) -> Unit
) {
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    val isLoading = passwordState is UiState.Loading
    val errorMessage = (passwordState as? UiState.Error)?.message
    val mismatch = confirmPassword.isNotEmpty() && newPassword != confirmPassword
    val valid = currentPassword.isNotBlank() && newPassword.length >= 6 && newPassword == confirmPassword

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("Change Password") },
        text = {
            Column {
                OutlinedTextField(
                    value = currentPassword,
                    onValueChange = { currentPassword = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Current Password *") },
                    singleLine = true,
                    enabled = !isLoading,
                    visualTransformation = PasswordVisualTransformation()
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = newPassword,
                    onValueChange = { newPassword = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("New Password (min 6) *") },
                    singleLine = true,
                    enabled = !isLoading,
                    visualTransformation = PasswordVisualTransformation()
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Confirm New Password *") },
                    singleLine = true,
                    enabled = !isLoading,
                    isError = mismatch,
                    supportingText = { if (mismatch) Text("Passwords do not match") },
                    visualTransformation = PasswordVisualTransformation()
                )
                if (errorMessage != null) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = errorMessage,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(currentPassword, newPassword) },
                enabled = valid && !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                } else {
                    Text("Change")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, enabled = !isLoading) {
                Text("Cancel")
            }
        }
    )
}
