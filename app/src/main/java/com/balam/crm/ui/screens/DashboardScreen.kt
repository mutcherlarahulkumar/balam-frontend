package com.balam.crm.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.balam.crm.ui.components.*
import com.balam.crm.ui.navigation.Screen
import com.balam.crm.ui.theme.*
import com.balam.crm.viewmodel.DashboardViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun DashboardScreen(
    navController: NavController,
    vm: DashboardViewModel = hiltViewModel()
) {
    val state by vm.dashboardState.collectAsStateWithLifecycle()
    val agent = vm.tokenStore.getAgent()

    LaunchedEffect(Unit) { vm.load() }

    Scaffold(
        topBar = {
            CrmTopBar(
                title = "Dashboard",
                actions = {
                    IconButton(onClick = { navController.navigate(Screen.Profile.route) }) {
                        Icon(Icons.Filled.AccountCircle, contentDescription = "Profile", tint = Color.White)
                    }
                }
            )
        }
    ) { padding ->
        when (val s = state) {
            is UiState.Loading, is UiState.Idle -> LoadingBox(Modifier.padding(padding))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.load() })
            is UiState.Success -> {
                val data = s.data
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Welcome banner
                    item {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Primary),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    "Welcome back,",
                                    color = Color.White.copy(alpha = 0.8f),
                                    style = MaterialTheme.typography.bodyMedium
                                )
                                Text(
                                    agent?.name ?: "Agent",
                                    color = Color.White,
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold
                                )
                                agent?.branch?.let {
                                    Text(it, color = Color.White.copy(alpha = 0.7f), style = MaterialTheme.typography.bodySmall)
                                }
                            }
                        }
                    }

                    // Quick stats
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            StatCard(
                                label = "Total Policies",
                                value = data.policies?.total?.toString() ?: "-",
                                color = Primary,
                                modifier = Modifier.weight(1f)
                            )
                            StatCard(
                                label = "FUP Due",
                                value = data.fupDue?.total?.toString() ?: "-",
                                color = FUPDue,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    // Commission summary
                    data.commissionSummary?.let { summary ->
                        item {
                            SectionCard(title = "This Month's Commission") {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            "₹${"%,.2f".format(summary.currentMonth.totalCommission)}",
                                            style = MaterialTheme.typography.titleLarge,
                                            fontWeight = FontWeight.Bold,
                                            color = Primary
                                        )
                                        Text(
                                            "${summary.currentMonth.policiesBilled} policies billed",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                    TextButton(onClick = { navController.navigate(Screen.Commission.route) }) {
                                        Text("View All")
                                    }
                                }
                            }
                        }
                    }

                    // FUP due section
                    if (!data.fupDue?.data.isNullOrEmpty()) {
                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("FUP Due", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                                TextButton(onClick = { navController.navigate(Screen.FUP.route) }) {
                                    Text("View All")
                                }
                            }
                        }
                        items(data.fupDue!!.data.take(3)) { item ->
                            Card(modifier = Modifier.fillMaxWidth()) {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(item.clientName, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyMedium)
                                        Text("Policy ${item.policyNo} • ${item.planName}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Column(horizontalAlignment = Alignment.End) {
                                        Text("₹${"%,.0f".format(item.premium)}", fontWeight = FontWeight.Bold, color = Primary)
                                        if (item.daysOverdue > 0) {
                                            Text("${item.daysOverdue}d overdue", style = MaterialTheme.typography.labelSmall, color = FUPOverdue)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Today's activities
                    if (!data.todayActivities?.data.isNullOrEmpty()) {
                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Today's Activities", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                                TextButton(onClick = { navController.navigate(Screen.Activities.route) }) {
                                    Text("View All")
                                }
                            }
                        }
                        items(data.todayActivities!!.data.take(3)) { activity ->
                            Card(modifier = Modifier.fillMaxWidth()) {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(activity.activityType, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyMedium)
                                        activity.details?.let {
                                            Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
                                        }
                                    }
                                    StatusBadge(activity.status)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
