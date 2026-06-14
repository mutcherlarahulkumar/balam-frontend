package com.balam.crm.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.Client
import com.balam.crm.data.model.FamilyDetail
import com.balam.crm.data.model.UpdateFamilyRequest
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.InfoRow
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SectionCard
import com.balam.crm.viewmodel.FamilyDetailViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun FamilyDetailScreen(
    familyCode: String,
    onBack: () -> Unit,
    onPolicyClick: (Int) -> Unit,
    onClientClick: (Int) -> Unit,
    onAddPolicy: (familyCode: String) -> Unit,
    onAddClient: () -> Unit,
    viewModel: FamilyDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val updateState by viewModel.updateState.collectAsStateWithLifecycle()
    var showEditDialog by remember { mutableStateOf(false) }

    LaunchedEffect(familyCode) {
        viewModel.load(familyCode)
    }

    LaunchedEffect(updateState) {
        if (updateState is UiState.Success) {
            showEditDialog = false
            viewModel.resetUpdateState()
            viewModel.load(familyCode)
        }
    }

    if (showEditDialog) {
        val current = (state as? UiState.Success)?.data
        if (current != null) {
            EditFamilyDialog(
                family = current,
                updateState = updateState,
                onDismiss = {
                    showEditDialog = false
                    viewModel.resetUpdateState()
                },
                onSubmit = { viewModel.updateFamily(familyCode, it) }
            )
        }
    }

    Scaffold(
        topBar = {
            BackTopBar(
                title = "Family $familyCode",
                onBack = onBack,
                actions = {
                    IconButton(onClick = { showEditDialog = true }) {
                        Icon(Icons.Filled.Edit, contentDescription = "Edit family")
                    }
                }
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        when (val s = state) {
            is UiState.Loading -> LoadingState(modifier = Modifier.padding(padding))
            is UiState.Error -> ErrorState(
                message = s.message,
                onRetry = { viewModel.load(familyCode) },
                modifier = Modifier.padding(padding)
            )
            is UiState.Success -> {
                val family = s.data
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        SectionCard(title = "Family Details") {
                            InfoRow("Head", family.headName, emphasize = true)
                            InfoRow("Mobile", family.mobile)
                            InfoRow("Email", family.email)
                            InfoRow("Address", family.address)
                            InfoRow("Pincode", family.pincode)
                            InfoRow("Designation", family.designation)
                            InfoRow("Last Update", formatDate(family.lastUpdate))
                        }
                    }
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            OutlinedButton(
                                onClick = { onAddClient() },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Add Client")
                            }
                            Button(
                                onClick = { onAddPolicy(family.familyCode) },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Add Policy")
                            }
                        }
                    }
                    item {
                        Text(
                            text = "Members (${family.members.size})",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                    if (family.members.isEmpty()) {
                        item {
                            Text(
                                text = "No members yet",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        items(family.members, key = { it.id }) { member ->
                            MemberCard(member = member, onClick = { onClientClick(member.id) })
                        }
                    }
                    item {
                        Text(
                            text = "Policies (${family.policies.size})",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                    if (family.policies.isEmpty()) {
                        item {
                            Text(
                                text = "No policies yet",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        items(family.policies, key = { it.id }) { policy ->
                            PolicyCard(policy = policy, onClick = { onPolicyClick(policy.policyNo) })
                        }
                    }
                    item { Spacer(Modifier.height(8.dp)) }
                }
            }
        }
    }
}

@Composable
private fun MemberCard(member: Client, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Filled.Person,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
            Column(modifier = Modifier.weight(1f).padding(start = 12.dp)) {
                Text(
                    text = member.name,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = listOfNotNull(
                        member.persCode,
                        member.age?.let { "$it yrs" },
                        member.mobile
                    ).joinToString(" · ").ifBlank { "—" },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Icon(
                Icons.Filled.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.outline
            )
        }
    }
}

@Composable
private fun EditFamilyDialog(
    family: FamilyDetail,
    updateState: UiState<*>?,
    onDismiss: () -> Unit,
    onSubmit: (UpdateFamilyRequest) -> Unit
) {
    var headName by remember { mutableStateOf(family.headName ?: "") }
    var mobile by remember { mutableStateOf(family.mobile ?: "") }
    var email by remember { mutableStateOf(family.email ?: "") }
    var address by remember { mutableStateOf(family.address ?: "") }
    var pincode by remember { mutableStateOf(family.pincode ?: "") }
    var designation by remember { mutableStateOf(family.designation ?: "") }

    val isLoading = updateState is UiState.Loading
    val errorMessage = (updateState as? UiState.Error)?.message

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("Edit Family") },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState()).imePadding()) {
                OutlinedTextField(
                    value = headName,
                    onValueChange = { headName = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Head Name") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                com.balam.crm.ui.components.PhoneField(
                    value = mobile,
                    onValueChange = { mobile = it },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Email") },
                    singleLine = true,
                    isError = email.isNotBlank() && !com.balam.crm.ui.components.isValidEmail(email),
                    supportingText = {
                        if (email.isNotBlank() && !com.balam.crm.ui.components.isValidEmail(email)) Text("Enter a valid email")
                    },
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = address,
                    onValueChange = { address = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Address") },
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = pincode,
                    onValueChange = { pincode = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Pincode") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = designation,
                    onValueChange = { designation = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Designation") },
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
                        UpdateFamilyRequest(
                            headName = headName.trim().takeIf { it.isNotBlank() },
                            mobile = mobile.trim().takeIf { it.isNotBlank() },
                            email = email.trim().takeIf { it.isNotBlank() },
                            address = address.trim().takeIf { it.isNotBlank() },
                            pincode = pincode.trim().takeIf { it.isNotBlank() },
                            designation = designation.trim().takeIf { it.isNotBlank() }
                        )
                    )
                },
                enabled = !isLoading && (mobile.isEmpty() || mobile.length == 10) && com.balam.crm.ui.components.isValidEmail(email)
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
