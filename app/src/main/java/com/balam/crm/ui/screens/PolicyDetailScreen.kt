package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.IconButton
import androidx.compose.material3.Icon
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
import com.balam.crm.data.model.PolicyDetail
import com.balam.crm.data.model.UpdatePolicyRequest
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.FupBadge
import com.balam.crm.ui.components.InfoRow
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SectionCard
import com.balam.crm.ui.components.StatusBadge
import com.balam.crm.ui.components.formatINR
import com.balam.crm.viewmodel.PolicyDetailViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun PolicyDetailScreen(
    policyNo: Int,
    onBack: () -> Unit,
    viewModel: PolicyDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val updateState by viewModel.updateState.collectAsStateWithLifecycle()
    var showEditDialog by remember { mutableStateOf(false) }

    LaunchedEffect(policyNo) {
        viewModel.load(policyNo)
    }

    LaunchedEffect(updateState) {
        if (updateState is UiState.Success) {
            showEditDialog = false
            viewModel.resetUpdateState()
            viewModel.load(policyNo)
        }
    }

    if (showEditDialog) {
        val current = (state as? UiState.Success)?.data
        if (current != null) {
            EditPolicyDialog(
                policy = current,
                updateState = updateState,
                onDismiss = {
                    showEditDialog = false
                    viewModel.resetUpdateState()
                },
                onSubmit = { viewModel.updatePolicy(policyNo, it) }
            )
        }
    }

    Scaffold(
        topBar = {
            BackTopBar(
                title = "Policy $policyNo",
                onBack = onBack,
                actions = {
                    IconButton(onClick = { showEditDialog = true }) {
                        Icon(Icons.Filled.Edit, contentDescription = "Edit policy")
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
                onRetry = { viewModel.load(policyNo) },
                modifier = Modifier.padding(padding)
            )
            is UiState.Success -> {
                val policy = s.data
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            StatusBadge(status = policy.status)
                            FupBadge(fupStatus = policy.fupStatus)
                        }
                    }
                    item {
                        SectionCard(title = "Plan") {
                            InfoRow("Plan", policy.planName ?: policy.plan?.toString())
                            InfoRow("Term / PPT", "${policy.term ?: "—"} / ${policy.ppt ?: "—"}")
                            InfoRow("Sum Assured", formatINR(policy.sumAssured), emphasize = true)
                            InfoRow("Premium", formatINR(policy.premium), emphasize = true)
                            InfoRow("Payment Mode", policy.paymentMode)
                            InfoRow("DAB", policy.dab?.toString())
                            InfoRow("Term Rider", policy.termRider?.toString())
                        }
                    }
                    item {
                        SectionCard(title = "Dates") {
                            InfoRow("Issue Date", formatDate(policy.issueDate))
                            InfoRow("Maturity Date", formatDate(policy.matDate))
                            InfoRow("Next Premium", formatDate(policy.nextPremium))
                            InfoRow("Last Paid", formatDate(policy.lastPaid))
                            InfoRow("Last FUP", formatDate(policy.lastFup))
                        }
                    }
                    item {
                        SectionCard(title = "Client & Nominee") {
                            InfoRow("Family Code", policy.familyCode)
                            InfoRow("Person Code", policy.persCode)
                            InfoRow("Age", policy.age?.toString())
                            InfoRow("Nominee", policy.nominee)
                            InfoRow("Relation", policy.relation)
                            InfoRow("NEFT", policy.neft)
                        }
                    }
                    item {
                        SectionCard(title = "Other") {
                            InfoRow("Maturity Amount", policy.matAmount?.let { formatINR(it) })
                            InfoRow("Agent Code", policy.agCode)
                            InfoRow("Branch", policy.branch)
                            InfoRow("Status Code", policy.statCd)
                        }
                    }
                    if (policy.loans.isNotEmpty()) {
                        item {
                            SectionCard(title = "Loans (${policy.loans.size})") {
                                policy.loans.forEach { loan ->
                                    InfoRow(
                                        "Loan · ${formatDate(loan.loanDate)}",
                                        formatINR(loan.loanAmount.toDouble()),
                                        emphasize = true
                                    )
                                }
                            }
                        }
                    }
                    if (policy.sbRecords.isNotEmpty()) {
                        item {
                            SectionCard(title = "Survival Benefits (${policy.sbRecords.size})") {
                                policy.sbRecords.forEach { sb ->
                                    InfoRow(
                                        "Inst. ${sb.instalmentNo} · due ${formatDate(sb.sbDueDate)}",
                                        formatINR(sb.sbAmount) + if (sb.sbPayDate != null) " (paid)" else ""
                                    )
                                }
                            }
                        }
                    }
                    if (policy.fupHistory.isNotEmpty()) {
                        item {
                            SectionCard(title = "FUP History") {
                                policy.fupHistory.forEach { h ->
                                    InfoRow(
                                        formatDate(h.updatedAt),
                                        "${formatDate(h.oldFup)} → ${formatDate(h.newFup)}"
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
private fun EditPolicyDialog(
    policy: PolicyDetail,
    updateState: UiState<*>?,
    onDismiss: () -> Unit,
    onSubmit: (UpdatePolicyRequest) -> Unit
) {
    var status by remember { mutableStateOf(policy.status) }
    var nominee by remember { mutableStateOf(policy.nominee ?: "") }
    var relation by remember { mutableStateOf(policy.relation ?: "") }
    var neft by remember { mutableStateOf(policy.neft ?: "") }
    var nextPremium by remember { mutableStateOf(policy.nextPremium ?: "") }
    var fupStatus by remember { mutableStateOf(policy.fupStatus) }

    val isLoading = updateState is UiState.Loading
    val errorMessage = (updateState as? UiState.Error)?.message

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("Edit Policy ${policy.policyNo}") },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                OutlinedTextField(
                    value = status,
                    onValueChange = { status = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Status") },
                    placeholder = { Text("IF/LA/PU/SU/MA") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = nominee,
                    onValueChange = { nominee = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Nominee") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = relation,
                    onValueChange = { relation = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Relation") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = neft,
                    onValueChange = { neft = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("NEFT") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                com.balam.crm.ui.components.DateField(
                    value = nextPremium,
                    onValueChange = { nextPremium = it },
                    label = "Next Premium",
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = fupStatus,
                    onValueChange = { fupStatus = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("FUP Status") },
                    placeholder = { Text("PAID/DUE/OVERDUE/LAPSED") },
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
                        UpdatePolicyRequest(
                            status = status.trim().takeIf { it.isNotBlank() },
                            nominee = nominee.trim().takeIf { it.isNotBlank() },
                            relation = relation.trim().takeIf { it.isNotBlank() },
                            neft = neft.trim().takeIf { it.isNotBlank() },
                            nextPremium = nextPremium.trim().takeIf { it.isNotBlank() },
                            fupStatus = fupStatus.trim().takeIf { it.isNotBlank() }
                        )
                    )
                },
                enabled = !isLoading
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
