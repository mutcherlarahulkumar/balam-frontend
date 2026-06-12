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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CurrencyRupee
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.Commission
import com.balam.crm.ui.components.EmptyState
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.InfoRow
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SectionCard
import com.balam.crm.ui.components.formatINR
import com.balam.crm.ui.theme.SuccessGreen
import com.balam.crm.viewmodel.CommissionViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun CommissionScreen(
    onBack: () -> Unit,
    viewModel: CommissionViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val summaryState by viewModel.summaryState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = { BackTopBar(title = "Commission", onBack = onBack) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        when (val s = state) {
            is UiState.Loading -> LoadingState(modifier = Modifier.padding(padding))
            is UiState.Error -> ErrorState(
                message = s.message,
                onRetry = {
                    viewModel.load(null, null)
                    viewModel.loadSummary()
                },
                modifier = Modifier.padding(padding)
            )
            is UiState.Success -> {
                val commissions = s.data.data
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    (summaryState as? UiState.Success)?.data?.let { summary ->
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.primaryContainer
                                )
                            ) {
                                Column(modifier = Modifier.padding(20.dp)) {
                                    Text(
                                        text = summary.currentMonth.month,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                    Spacer(Modifier.height(4.dp))
                                    Text(
                                        text = formatINR(summary.currentMonth.totalCommission),
                                        style = MaterialTheme.typography.headlineMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                    Text(
                                        text = "${summary.currentMonth.policiesBilled} policies billed",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                }
                            }
                        }
                        if (summary.yearly.isNotEmpty()) {
                            item {
                                SectionCard(title = "Yearly Summary") {
                                    summary.yearly.forEach { y ->
                                        InfoRow(
                                            "${y.year}",
                                            "${formatINR(y.gross)} (FY ${formatINR(y.firstYear)} · Ren ${formatINR(y.renewal)})"
                                        )
                                    }
                                }
                            }
                        }
                    }
                    item {
                        Text(
                            text = "Commission Entries (${commissions.size})",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                    if (commissions.isEmpty()) {
                        item {
                            EmptyState(
                                icon = Icons.Filled.CurrencyRupee,
                                message = "No commission records found",
                                modifier = Modifier.height(220.dp)
                            )
                        }
                    } else {
                        items(commissions, key = { it.id }) { commission ->
                            CommissionCard(commission = commission)
                        }
                    }
                    item { Spacer(Modifier.height(8.dp)) }
                }
            }
        }
    }
}

@Composable
private fun CommissionCard(commission: Commission) {
    val total = commission.firstComm + commission.secondComm + commission.thirdComm +
        commission.bonusComm + commission.singleComm + commission.subComm
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Policy ${commission.policyNo}",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = formatINR(total),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = SuccessGreen
                )
            }
            Spacer(Modifier.height(4.dp))
            Text(
                text = "Bill ${formatDate(commission.billDate)} · Paid ${formatDate(commission.payDate)}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = buildList {
                    if (commission.firstComm > 0) add("1st ${formatINR(commission.firstComm)}")
                    if (commission.secondComm > 0) add("2nd ${formatINR(commission.secondComm)}")
                    if (commission.thirdComm > 0) add("3rd ${formatINR(commission.thirdComm)}")
                    if (commission.bonusComm > 0) add("Bonus ${formatINR(commission.bonusComm)}")
                    if (commission.singleComm > 0) add("Single ${formatINR(commission.singleComm)}")
                    if (commission.subComm > 0) add("Sub ${formatINR(commission.subComm)}")
                }.joinToString(" · ").ifBlank { "No breakdown" },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
