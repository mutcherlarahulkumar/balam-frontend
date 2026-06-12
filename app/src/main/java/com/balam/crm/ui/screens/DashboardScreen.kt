package com.balam.crm.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.CurrencyRupee
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.FUPDueItem
import com.balam.crm.ui.components.Badge
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.StatCard
import com.balam.crm.ui.components.formatINR
import com.balam.crm.ui.navigation.Routes
import com.balam.crm.ui.theme.DangerRed
import com.balam.crm.ui.theme.SuccessGreen
import com.balam.crm.ui.theme.WarningOrange
import com.balam.crm.viewmodel.DashboardViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun DashboardScreen(
    onPolicyClick: (Int) -> Unit,
    onNavigate: (String) -> Unit,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    when (val s = state) {
        is UiState.Loading -> LoadingState()
        is UiState.Error -> ErrorState(message = s.message, onRetry = { viewModel.load() })
        is UiState.Success -> {
            val data = s.data
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Column {
                        Text(
                            text = "Hello, ${data.agentName}",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Here's your business at a glance",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        StatCard(
                            title = "Policies",
                            value = data.policyCount.toString(),
                            icon = Icons.Filled.Description,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "FUP Due",
                            value = data.fupDueCount.toString(),
                            icon = Icons.Filled.DateRange,
                            tint = WarningOrange,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
                item {
                    StatCard(
                        title = "Commission · ${data.monthLabel}",
                        value = formatINR(data.monthCommission),
                        icon = Icons.Filled.CurrencyRupee,
                        tint = SuccessGreen,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                item {
                    Text(
                        text = "Quick actions",
                        style = MaterialTheme.typography.titleMedium
                    )
                }
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        QuickActionChip("Clients", Icons.Filled.Person) { onNavigate(Routes.CLIENTS) }
                        QuickActionChip("Leads", Icons.Filled.PersonAdd) { onNavigate(Routes.LEADS) }
                        QuickActionChip("Activities", Icons.Filled.Event) { onNavigate(Routes.ACTIVITIES) }
                        QuickActionChip("GST", Icons.Filled.Calculate) { onNavigate(Routes.GST) }
                    }
                }
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Urgent follow-ups",
                            style = MaterialTheme.typography.titleMedium
                        )
                        Text(
                            text = "View all",
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.clickable { onNavigate(Routes.FUP) }
                        )
                    }
                }
                if (data.urgentFups.isEmpty()) {
                    item {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                        ) {
                            Text(
                                text = "No premiums due right now. Great job!",
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(20.dp),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                } else {
                    items(data.urgentFups, key = { it.policyNo }) { fup ->
                        UrgentFupCard(fup = fup, onClick = { onPolicyClick(fup.policyNo) })
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickActionChip(label: String, icon: ImageVector, onClick: () -> Unit) {
    AssistChip(
        onClick = onClick,
        label = { Text(label) },
        leadingIcon = {
            Icon(icon, contentDescription = null, modifier = Modifier.width(18.dp))
        }
    )
}

@Composable
private fun UrgentFupCard(fup: FUPDueItem, onClick: () -> Unit) {
    val overdue = fup.daysOverdue > 0
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
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = fup.clientName,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = "Policy ${fup.policyNo} · ${fup.planName ?: "—"}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "${formatINR(fup.premium)} · due ${formatDate(fup.nextPremium)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Spacer(Modifier.width(12.dp))
            if (overdue) {
                Badge(text = "${fup.daysOverdue}d overdue", color = DangerRed)
            } else {
                Badge(text = "Due", color = WarningOrange)
            }
        }
    }
}
