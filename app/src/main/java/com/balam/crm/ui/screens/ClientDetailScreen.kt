package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.ClientDetail
import com.balam.crm.data.model.UpdateClientRequest
import com.balam.crm.ui.components.DateField
import com.balam.crm.ui.components.EmptyState
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.InfoRow
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SectionCard
import com.balam.crm.ui.components.ShareButtons
import com.balam.crm.viewmodel.ClientDetailViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun ClientDetailScreen(
    clientId: Int,
    onBack: () -> Unit,
    onPolicyClick: (Int) -> Unit,
    onAddPolicy: (familyCode: String, persCode: String) -> Unit,
    viewModel: ClientDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val updateState by viewModel.updateState.collectAsStateWithLifecycle()
    var showEditDialog by remember { mutableStateOf(false) }

    LaunchedEffect(clientId) {
        viewModel.load(clientId)
    }

    LaunchedEffect(updateState) {
        if (updateState is UiState.Success) {
            showEditDialog = false
            viewModel.resetUpdateState()
            viewModel.load(clientId)
        }
    }

    if (showEditDialog) {
        val current = (state as? UiState.Success)?.data
        if (current != null) {
            EditClientDialog(
                client = current,
                updateState = updateState,
                onDismiss = {
                    showEditDialog = false
                    viewModel.resetUpdateState()
                },
                onSubmit = { viewModel.updateClient(clientId, it) }
            )
        }
    }

    Scaffold(
        topBar = {
            BackTopBar(
                title = "Client",
                onBack = onBack,
                actions = {
                    IconButton(onClick = { showEditDialog = true }) {
                        Icon(Icons.Filled.Edit, contentDescription = "Edit client")
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
                onRetry = { viewModel.load(clientId) },
                modifier = Modifier.padding(padding)
            )
            is UiState.Success -> {
                val client = s.data
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        SectionCard(title = "Personal Details") {
                            InfoRow("Name", client.name, emphasize = true)
                            InfoRow("Family Code", client.familyCode)
                            InfoRow("Person Code", client.persCode)
                            InfoRow("Mobile", client.mobile)
                            InfoRow("Email", client.email)
                            InfoRow("DOB", formatDate(client.dob))
                            InfoRow("Age", client.age?.toString())
                            InfoRow("Sex", client.sex)
                            InfoRow("Occupation", client.occupation)
                            InfoRow("Client Type", client.clientType)
                            InfoRow("Address", client.address)
                            InfoRow("City", client.city)
                            InfoRow("State", client.state)
                            InfoRow("Source", client.source)
                        }
                    }
                    if (!client.mobile.isNullOrBlank()) {
                        item {
                            ShareButtons(
                                mobile = client.mobile,
                                message = "Hi ${client.name ?: "—"}, this is regarding your insurance policy. Please contact us for any queries."
                            )
                        }
                    }
                    if (!client.comment.isNullOrBlank()) {
                        item {
                            SectionCard(title = "Notes") {
                                Text(
                                    text = client.comment,
                                    style = MaterialTheme.typography.bodyMedium,
                                    modifier = Modifier.padding(vertical = 4.dp)
                                )
                            }
                        }
                    }
                    item {
                        Text(
                            text = "Policies (${client.policies.orEmpty().size})",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                    item {
                        Button(
                            onClick = {
                                onAddPolicy(client.familyCode, client.persCode ?: "")
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Add Policy")
                        }
                    }
                    if (client.policies.orEmpty().isEmpty()) {
                        item {
                            EmptyState(
                                icon = Icons.Filled.Description,
                                message = "No policies",
                                modifier = Modifier.height(160.dp)
                            )
                        }
                    } else {
                        items(client.policies.orEmpty(), key = { it.id }) { policy ->
                            PolicyCard(policy = policy, onClick = { onPolicyClick(policy.policyNo) })
                        }
                    }
                    if (client.bankDetails.orEmpty().isNotEmpty()) {
                        item {
                            SectionCard(title = "Bank Details") {
                                client.bankDetails.orEmpty().forEachIndexed { index, bank ->
                                    if (index > 0) {
                                        Spacer(Modifier.height(8.dp))
                                        HorizontalDivider(color = MaterialTheme.colorScheme.surfaceVariant)
                                        Spacer(Modifier.height(8.dp))
                                    }
                                    InfoRow("Bank", bank.bankName)
                                    InfoRow("Account No", bank.accountNumber, emphasize = true)
                                    InfoRow("IFSC", bank.ifseCode)
                                    InfoRow("PAN", bank.pan)
                                    InfoRow("Aadhaar", bank.aadhar)
                                }
                            }
                        }
                    }
                    if (client.documents.orEmpty().isNotEmpty()) {
                        item {
                            SectionCard(title = "Documents (${client.documents.orEmpty().size})") {
                                client.documents.orEmpty().forEach { doc ->
                                    InfoRow(
                                        doc.title ?: "Document",
                                        doc.policyNo?.let { "Policy $it" } ?: "—"
                                    )
                                }
                            }
                        }
                    }
                    item { Spacer(Modifier.height(8.dp)) }
                }
            }
        }
    }
}

@Composable
private fun EditClientDialog(
    client: ClientDetail,
    updateState: UiState<*>?,
    onDismiss: () -> Unit,
    onSubmit: (UpdateClientRequest) -> Unit
) {
    var name by remember { mutableStateOf(client.name ?: "") }
    var mobile by remember { mutableStateOf(client.mobile ?: "") }
    var email by remember { mutableStateOf(client.email ?: "") }
    var dob by remember { mutableStateOf(client.dob ?: "") }
    var sex by remember { mutableStateOf(client.sex ?: "") }
    var occupation by remember { mutableStateOf(client.occupation ?: "") }
    var clientType by remember { mutableStateOf(client.clientType ?: "") }
    var address by remember { mutableStateOf(client.address ?: "") }

    val isLoading = updateState is UiState.Loading
    val errorMessage = (updateState as? UiState.Error)?.message

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("Edit Client") },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState()).imePadding()) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Name") },
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
                DateField(
                    value = dob,
                    onValueChange = { dob = it },
                    label = "DOB",
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = sex,
                    onValueChange = { sex = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Sex") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = occupation,
                    onValueChange = { occupation = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Occupation") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = clientType,
                    onValueChange = { clientType = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Client Type") },
                    singleLine = true,
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
                        UpdateClientRequest(
                            name = name.trim().takeIf { it.isNotBlank() },
                            dob = dob.trim().takeIf { it.isNotBlank() },
                            sex = sex.trim().takeIf { it.isNotBlank() },
                            mobile = mobile.trim().takeIf { it.isNotBlank() },
                            email = email.trim().takeIf { it.isNotBlank() },
                            occupation = occupation.trim().takeIf { it.isNotBlank() },
                            clientType = clientType.trim().takeIf { it.isNotBlank() },
                            address = address.trim().takeIf { it.isNotBlank() }
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
