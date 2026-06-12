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
import androidx.compose.foundation.lazy.LazyColumn
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

    LaunchedEffect(policyNo) {
        viewModel.load(policyNo)
    }

    Scaffold(
        topBar = { BackTopBar(title = "Policy $policyNo", onBack = onBack) },
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
