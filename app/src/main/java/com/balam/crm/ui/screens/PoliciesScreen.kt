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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.PolicyListItem
import com.balam.crm.ui.components.EmptyState
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.FupBadge
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SearchField
import com.balam.crm.ui.components.StatusBadge
import com.balam.crm.ui.components.formatINR
import com.balam.crm.viewmodel.PoliciesViewModel
import com.balam.crm.viewmodel.UiState
import kotlinx.coroutines.delay

private val statusFilters = listOf(
    null to "All",
    "IF" to "In Force",
    "LA" to "Lapsed",
    "PU" to "Paid Up",
    "MA" to "Matured"
)

@Composable
fun PoliciesScreen(
    onPolicyClick: (Int) -> Unit,
    viewModel: PoliciesViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var query by rememberSaveable { mutableStateOf("") }
    var status by rememberSaveable { mutableStateOf<String?>(null) }

    LaunchedEffect(query, status) {
        if (query.isNotEmpty()) delay(400)
        viewModel.load(search = query, status = status)
    }

    Column(modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
        Spacer(Modifier.height(16.dp))
        Text(
            text = "Policies",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        Spacer(Modifier.height(12.dp))
        SearchField(
            value = query,
            onValueChange = { query = it },
            placeholder = "Search by policy no, client name…"
        )
        Spacer(Modifier.height(8.dp))
        Row(
            modifier = Modifier.horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            statusFilters.forEach { (code, label) ->
                FilterChip(
                    selected = status == code,
                    onClick = { status = code },
                    label = { Text(label) }
                )
            }
        }
        Spacer(Modifier.height(4.dp))

        when (val s = state) {
            is UiState.Loading -> LoadingState()
            is UiState.Error -> ErrorState(message = s.message, onRetry = { viewModel.load(query, status) })
            is UiState.Success -> {
                val policies = s.data.data
                if (policies.isEmpty()) {
                    EmptyState(icon = Icons.Filled.Description, message = "No policies found")
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(policies, key = { it.id }) { policy ->
                            PolicyCard(policy = policy, onClick = { onPolicyClick(policy.policyNo) })
                        }
                    }
                }
            }
        }
    }
}

@Composable
internal fun PolicyCard(policy: PolicyListItem, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
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
                    text = policy.clientName,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                StatusBadge(status = policy.status)
            }
            Spacer(Modifier.height(4.dp))
            Text(
                text = "Policy ${policy.policyNo} · ${policy.planName ?: "Plan ${policy.planNo ?: "—"}"}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = formatINR(policy.premium),
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "${policy.paymentMode ?: "—"} · next ${formatDate(policy.nextPremium)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                FupBadge(fupStatus = policy.fupStatus)
            }
        }
    }
}
