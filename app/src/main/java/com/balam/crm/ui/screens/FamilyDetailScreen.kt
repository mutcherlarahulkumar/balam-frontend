package com.balam.crm.ui.screens

import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.Client
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.InfoRow
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SectionCard
import com.balam.crm.viewmodel.FamilyDetailViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun FamilyDetailScreen(
    familyCode: String,
    onBack: () -> Unit,
    onPolicyClick: (Int) -> Unit,
    onClientClick: (Int) -> Unit,
    viewModel: FamilyDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(familyCode) {
        viewModel.load(familyCode)
    }

    Scaffold(
        topBar = { BackTopBar(title = "Family $familyCode", onBack = onBack) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        when (val s = state) {
            is UiState.Loading -> LoadingState(modifier = Modifier.padding(padding))
            is UiState.Error -> ErrorState(
                message = s.message,
                onRetry = { viewModel.load(familyCode) },
                modifier = Modifier.padding(padding)
            )
            is UiState.Success -> {
                val family = s.data
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        SectionCard(title = "Family Details") {
                            InfoRow("Head", family.headName, emphasize = true)
                            InfoRow("Mobile", family.mobile)
                            InfoRow("Email", family.email)
                            InfoRow("Address", family.address)
                            InfoRow("Pincode", family.pincode)
                            InfoRow("Designation", family.designation)
                            InfoRow("Last Update", formatDate(family.lastUpdate))
                        }
                    }
                    item {
                        Text(
                            text = "Members (${family.members.size})",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                    if (family.members.isEmpty()) {
                        item {
                            Text(
                                text = "No members yet",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        items(family.members, key = { it.id }) { member ->
                            MemberCard(member = member, onClick = { onClientClick(member.id) })
                        }
                    }
                    item {
                        Text(
                            text = "Policies (${family.policies.size})",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                    if (family.policies.isEmpty()) {
                        item {
                            Text(
                                text = "No policies yet",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        items(family.policies, key = { it.id }) { policy ->
                            PolicyCard(policy = policy, onClick = { onPolicyClick(policy.policyNo) })
                        }
                    }
                    item { Spacer(Modifier.height(8.dp)) }
                }
            }
        }
    }
}

@Composable
private fun MemberCard(member: Client, onClick: () -> Unit) {
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
            Icon(
                Icons.Filled.Person,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
            Column(modifier = Modifier.weight(1f).padding(start = 12.dp)) {
                Text(
                    text = member.name,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = listOfNotNull(
                        member.persCode,
                        member.age?.let { "$it yrs" },
                        member.mobile
                    ).joinToString(" · ").ifBlank { "—" },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Icon(
                Icons.Filled.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.outline
            )
        }
    }
}
