package com.balam.crm.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.balam.crm.ui.components.CrmTopBar
import com.balam.crm.ui.navigation.Screen
import com.balam.crm.ui.theme.Primary

data class MenuItem(val title: String, val icon: ImageVector, val route: String, val description: String = "")

val moreMenuItems = listOf(
    MenuItem("Clients", Icons.Filled.People, Screen.Clients.route, "Manage client records"),
    MenuItem("Commission", Icons.Filled.AccountBalance, Screen.Commission.route, "Track commission earnings"),
    MenuItem("Loans", Icons.Filled.RequestPage, Screen.Loans.route, "Policy loan records"),
    MenuItem("Survival Benefits", Icons.Filled.VolunteerActivism, Screen.SB.route, "SB due and paid"),
    MenuItem("Leads", Icons.Filled.PersonAdd, Screen.Leads.route, "Prospect leads"),
    MenuItem("Activities", Icons.Filled.EventNote, Screen.Activities.route, "Track calls and visits"),
    MenuItem("GST Calculator", Icons.Filled.Calculate, Screen.GST.route, "Calculate GST on premium"),
    MenuItem("Reports", Icons.Filled.BarChart, Screen.Reports.route, "Cash in/out reports"),
    MenuItem("Profile", Icons.Filled.ManageAccounts, Screen.Profile.route, "Your account settings"),
)

@Composable
fun MoreScreen(navController: NavController) {
    Scaffold(topBar = { CrmTopBar(title = "More") }) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                Text(
                    "All Features",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
            }
            items(moreMenuItems.size) { index ->
                val item = moreMenuItems[index]
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { navController.navigate(item.route) },
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Surface(
                            modifier = Modifier.size(44.dp),
                            shape = MaterialTheme.shapes.medium,
                            color = Primary.copy(alpha = 0.1f)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(item.icon, contentDescription = item.title, tint = Primary)
                            }
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(item.title, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyLarge)
                            if (item.description.isNotBlank()) {
                                Text(item.description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                        Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}
