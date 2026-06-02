package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.UpdateProfileRequest
import com.balam.crm.ui.components.*
import com.balam.crm.ui.theme.Primary
import com.balam.crm.viewmodel.AuthViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun ProfileScreen(
    onLogout: () -> Unit,
    vm: AuthViewModel = hiltViewModel()
) {
    val agent = vm.tokenStore.getAgent()
    val profileState by vm.profileState.collectAsStateWithLifecycle()
    val changePasswordState by vm.changePasswordState.collectAsStateWithLifecycle()
    var showEditDialog by remember { mutableStateOf(false) }
    var showChangePasswordDialog by remember { mutableStateOf(false) }
    var showLogoutDialog by remember { mutableStateOf(false) }

    LaunchedEffect(profileState) {
        if (profileState is UiState.Success) showEditDialog = false
    }
    LaunchedEffect(changePasswordState) {
        if (changePasswordState is UiState.Success) showChangePasswordDialog = false
    }

    Scaffold(
        topBar = {
            CrmTopBar(
                title = "Profile",
                actions = {
                    IconButton(onClick = { showLogoutDialog = true }) {
                        Icon(Icons.Filled.Logout, contentDescription = "Logout", tint = Color.White)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Avatar / name card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Primary)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Surface(
                        modifier = Modifier.size(72.dp),
                        shape = MaterialTheme.shapes.extraLarge,
                        color = Color.White.copy(alpha = 0.2f)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = agent?.name?.firstOrNull()?.uppercase() ?: "A",
                                style = MaterialTheme.typography.headlineMedium,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Spacer(Modifier.height(12.dp))
                    Text(agent?.name ?: "-", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(agent?.agentCode ?: "-", style = MaterialTheme.typography.bodyMedium, color = Color.White.copy(alpha = 0.8f))
                }
            }

            SectionCard("Agent Details") {
                InfoRow("Agent Code", agent?.agentCode)
                InfoRow("Mobile", agent?.mobile)
                InfoRow("Email", agent?.email)
                InfoRow("Branch", agent?.branch)
                InfoRow("Club", agent?.club)
                InfoRow("Licence No", agent?.licenceNo)
            }

            Button(
                onClick = { showEditDialog = true },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Edit Profile")
            }

            OutlinedButton(
                onClick = { showChangePasswordDialog = true },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Change Password")
            }
        }
    }

    if (showEditDialog && agent != null) {
        EditProfileDialog(
            currentName = agent.name,
            currentMobile = agent.mobile,
            currentEmail = agent.email ?: "",
            isLoading = profileState is UiState.Loading,
            error = (profileState as? UiState.Error)?.message,
            onDismiss = { showEditDialog = false },
            onConfirm = { name, mobile, email ->
                vm.updateProfile(UpdateProfileRequest(name = name, mobile = mobile, email = email.ifBlank { null }))
            }
        )
    }

    if (showChangePasswordDialog) {
        ChangePasswordDialog(
            isLoading = changePasswordState is UiState.Loading,
            error = (changePasswordState as? UiState.Error)?.message,
            onDismiss = { showChangePasswordDialog = false; vm.resetPasswordState() },
            onConfirm = { current, newPass -> vm.changePassword(current, newPass) }
        )
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Logout") },
            text = { Text("Are you sure you want to logout?") },
            confirmButton = {
                Button(
                    onClick = onLogout,
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) { Text("Logout") }
            },
            dismissButton = { TextButton(onClick = { showLogoutDialog = false }) { Text("Cancel") } }
        )
    }
}

@Composable
fun EditProfileDialog(
    currentName: String,
    currentMobile: String,
    currentEmail: String,
    isLoading: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onConfirm: (name: String, mobile: String, email: String) -> Unit
) {
    var name by remember { mutableStateOf(currentName) }
    var mobile by remember { mutableStateOf(currentMobile) }
    var email by remember { mutableStateOf(currentEmail) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edit Profile") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Name *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = mobile, onValueChange = { mobile = it }, label = { Text("Mobile *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(name.trim(), mobile.trim(), email.trim()) },
                enabled = name.isNotBlank() && mobile.isNotBlank() && !isLoading
            ) {
                if (isLoading) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                else Text("Save")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun ChangePasswordDialog(
    isLoading: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onConfirm: (current: String, new: String) -> Unit
) {
    var current by remember { mutableStateOf("") }
    var newPass by remember { mutableStateOf("") }
    var confirmNew by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Change Password") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(value = current, onValueChange = { current = it }, label = { Text("Current Password *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = newPass, onValueChange = { newPass = it }, label = { Text("New Password *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(
                    value = confirmNew, onValueChange = { confirmNew = it },
                    label = { Text("Confirm New Password *") }, singleLine = true,
                    isError = confirmNew.isNotBlank() && confirmNew != newPass,
                    modifier = Modifier.fillMaxWidth()
                )
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(current, newPass) },
                enabled = current.isNotBlank() && newPass.isNotBlank() && newPass == confirmNew && !isLoading
            ) {
                if (isLoading) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                else Text("Change")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}
