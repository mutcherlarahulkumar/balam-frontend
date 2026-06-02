package com.balam.crm.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.PolicyListItem
import com.balam.crm.ui.components.*
import com.balam.crm.ui.theme.Primary
import com.balam.crm.viewmodel.PoliciesViewModel
import com.balam.crm.viewmodel.UiState

val POLICY_STATUSES = listOf("", "IF", "LA", "PU", "SU", "MA", "CL", "EX")

@Composable
fun PoliciesScreen(
    onPolicyClick: (Int) -> Unit,
    vm: PoliciesViewModel = hiltViewModel()
) {
    val policiesState by vm.policies.collectAsStateWithLifecycle()
    var searchText by remember { mutableStateOf("") }
    var selectedStatus by remember { mutableStateOf<String?>(null) }
    var showFilterSheet by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) { vm.loadPolicies() }

    Scaffold(
        topBar = { CrmTopBar(title = "Policies") }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            // Search bar
            OutlinedTextField(
                value = searchText,
                onValueChange = {
                    searchText = it
                    vm.search.value = it
                },
                placeholder = { Text("Search policies...") },
                leadingIcon = { Icon(Icons.Filled.Search, null) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp)
            )

            // Status filter chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .padding(bottom = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                listOf(null, "IF", "LA", "PU", "SU").forEach { status ->
                    FilterChip(
                        selected = selectedStatus == status,
                        onClick = {
                            selectedStatus = status
                            vm.statusFilter.value = status
                            vm.loadPolicies()
                        },
                        label = { Text(status ?: "All") }
                    )
                }
            }

            when (val s = policiesState) {
                is UiState.Loading, is UiState.Idle -> LoadingBox()
                is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadPolicies() })
                is UiState.Success -> {
                    val policies = s.data.data
                    if (policies.isEmpty()) {
                        EmptyBox("No policies found")
                    } else {
                        LazyColumn(
                            contentPadding = PaddingValues(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            item {
                                Text(
                                    "${s.data.total} policies",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(bottom = 4.dp)
                                )
                            }
                            items(policies) { policy ->
                                PolicyCard(policy = policy, onClick = { onPolicyClick(policy.policyNo) })
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PolicyCard(policy: PolicyListItem, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = policy.clientName,
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "Policy #${policy.policyNo}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    StatusBadge(policy.status)
                    FUPBadge(policy.fupStatus)
                }
            }
            Spacer(Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Plan", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(policy.planName ?: "-", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Medium)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("Premium", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("₹${"%,.2f".format(policy.premium)}", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold, color = Primary)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("Sum Assured", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("₹${"%,.0f".format(policy.sumAssured)}", style = MaterialTheme.typography.bodySmall)
                }
            }
            policy.nextPremium?.let {
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Next premium: $it",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun PolicyDetailScreen(
    policyNo: Int,
    onBack: () -> Unit,
    vm: PoliciesViewModel = hiltViewModel()
) {
    val detailState by vm.policyDetail.collectAsStateWithLifecycle()

    LaunchedEffect(policyNo) { vm.loadPolicyDetail(policyNo) }

    Scaffold(topBar = { CrmTopBar(title = "Policy #$policyNo", onBack = onBack) }) { padding ->
        when (val s = detailState) {
            is UiState.Loading, is UiState.Idle -> LoadingBox(Modifier.padding(padding))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadPolicyDetail(policyNo) })
            is UiState.Success -> {
                val p = s.data
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Primary)) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Policy #${p.policyNo}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color.White)
                                Text("Family: ${p.familyCode}", style = MaterialTheme.typography.bodyMedium, color = Color.White.copy(alpha = 0.8f))
                                Spacer(Modifier.height(8.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    StatusBadge(p.status)
                                    FUPBadge(p.fupStatus)
                                }
                            }
                        }
                    }
                    item {
                        SectionCard("Policy Details") {
                            InfoRow("Plan", p.planName)
                            InfoRow("Plan No", p.plan?.toString())
                            InfoRow("Family Code", p.familyCode)
                            InfoRow("Pers Code", p.persCode)
                            InfoRow("Premium", "₹${"%,.2f".format(p.premium)}")
                            InfoRow("Sum Assured", "₹${"%,.0f".format(p.sumAssured)}")
                            InfoRow("Term", p.term?.let { "$it years" })
                            InfoRow("PPT", p.ppt?.let { "$it years" })
                            InfoRow("Mode", p.paymentMode)
                            InfoRow("Agent Code", p.agCode)
                            InfoRow("Branch", p.branch)
                        }
                    }
                    item {
                        SectionCard("Dates") {
                            InfoRow("Issue Date", p.issueDate)
                            InfoRow("FUP", p.lastFup)
                            InfoRow("Last Paid", p.lastPaid)
                            InfoRow("Next Premium", p.nextPremium)
                            InfoRow("Maturity Date", p.matDate)
                        }
                    }
                    item {
                        SectionCard("Additional") {
                            InfoRow("Nominee", p.nominee)
                            InfoRow("Relation", p.relation)
                            InfoRow("NEFT", p.neft)
                            InfoRow("Age", p.age?.toString())
                            p.dab?.let { InfoRow("DAB", it.toString()) }
                            p.termRider?.let { InfoRow("Term Rider", it.toString()) }
                        }
                    }
                }
            }
        }
    }
}
