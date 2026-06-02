package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.ui.components.*
import com.balam.crm.ui.theme.FUPDue
import com.balam.crm.ui.theme.FUPOverdue
import com.balam.crm.ui.theme.FUPPaid
import com.balam.crm.ui.theme.Primary
import com.balam.crm.viewmodel.ReportsViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun ReportsScreen(vm: ReportsViewModel = hiltViewModel()) {
    val cashState by vm.cashInOut.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) { vm.load() }

    Scaffold(topBar = { CrmTopBar(title = "Reports") }) { padding ->
        when (val s = cashState) {
            is UiState.Loading, is UiState.Idle -> LoadingBox(Modifier.padding(padding))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.load() })
            is UiState.Success -> {
                val data = s.data.data
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        SectionCard("Cash In / Out") {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Month", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1.5f))
                                Text("Income", style = MaterialTheme.typography.labelSmall, color = FUPPaid, modifier = Modifier.weight(1f))
                                Text("Expense", style = MaterialTheme.typography.labelSmall, color = FUPOverdue, modifier = Modifier.weight(1f))
                                Text("Net", style = MaterialTheme.typography.labelSmall, color = Primary, modifier = Modifier.weight(1f))
                            }
                            Divider()
                        }
                    }
                    items(data) { item ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = if (item.net >= 0) FUPPaid.copy(alpha = 0.05f)
                                else FUPOverdue.copy(alpha = 0.05f)
                            ),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(item.month, fontWeight = FontWeight.Medium, style = MaterialTheme.typography.bodySmall, modifier = Modifier.weight(1.5f))
                                Text("₹${"%,.0f".format(item.income)}", style = MaterialTheme.typography.bodySmall, color = FUPPaid, modifier = Modifier.weight(1f))
                                Text("₹${"%,.0f".format(item.expense)}", style = MaterialTheme.typography.bodySmall, color = FUPOverdue, modifier = Modifier.weight(1f))
                                Text(
                                    "₹${"%,.0f".format(item.net)}",
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = FontWeight.Bold,
                                    color = if (item.net >= 0) FUPPaid else FUPOverdue,
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                    }

                    if (data.isNotEmpty()) {
                        item {
                            val totalIncome = data.sumOf { it.income }
                            val totalExpense = data.sumOf { it.expense }
                            val totalNet = data.sumOf { it.net }
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = Primary.copy(alpha = 0.1f))
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Total", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1.5f))
                                    Text("₹${"%,.0f".format(totalIncome)}", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold, color = FUPPaid, modifier = Modifier.weight(1f))
                                    Text("₹${"%,.0f".format(totalExpense)}", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold, color = FUPOverdue, modifier = Modifier.weight(1f))
                                    Text(
                                        "₹${"%,.0f".format(totalNet)}",
                                        style = MaterialTheme.typography.bodySmall,
                                        fontWeight = FontWeight.Bold,
                                        color = if (totalNet >= 0) FUPPaid else FUPOverdue,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
