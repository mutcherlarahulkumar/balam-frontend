package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.InfoRow
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SectionCard
import com.balam.crm.viewmodel.ClientDetailViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun ClientDetailScreen(
    clientId: Int,
    onBack: () -> Unit,
    onPolicyClick: (Int) -> Unit,
    viewModel: ClientDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(clientId) {
        viewModel.load(clientId)
    }

    Scaffold(
        topBar = { BackTopBar(title = "Client", onBack = onBack) },
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
                            text = "Policies (${client.policies.size})",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                    if (client.policies.isEmpty()) {
                        item {
                            Text(
                                text = "No policies",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        items(client.policies, key = { it.id }) { policy ->
                            PolicyCard(policy = policy, onClick = { onPolicyClick(policy.policyNo) })
                        }
                    }
                    if (client.bankDetails.isNotEmpty()) {
                        item {
                            SectionCard(title = "Bank Details") {
                                client.bankDetails.forEachIndexed { index, bank ->
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
                    if (client.documents.isNotEmpty()) {
                        item {
                            SectionCard(title = "Documents (${client.documents.size})") {
                                client.documents.forEach { doc ->
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
