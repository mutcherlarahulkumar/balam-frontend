package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
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
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.MarkSBPaidRequest
import com.balam.crm.data.model.SBItem
import com.balam.crm.ui.components.AccentCard
import com.balam.crm.ui.components.Badge
import com.balam.crm.ui.components.EmptyState
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SegmentedToggle
import com.balam.crm.ui.components.formatINR
import com.balam.crm.ui.theme.SuccessGreen
import com.balam.crm.ui.theme.WarningOrange
import com.balam.crm.viewmodel.SBViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun SBScreen(
    onBack: () -> Unit,
    viewModel: SBViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val actionState by viewModel.actionState.collectAsStateWithLifecycle()
    var unpaidOnly by rememberSaveable { mutableStateOf(true) }
    var payItem by remember { mutableStateOf<SBItem?>(null) }

    LaunchedEffect(unpaidOnly) {
        viewModel.load(unpaidOnly)
    }

    LaunchedEffect(actionState) {
        if (actionState is UiState.Success) {
            payItem = null
            viewModel.resetActionState()
            viewModel.load(unpaidOnly)
        }
    }

    Scaffold(
        topBar = { BackTopBar(title = "Survival Benefits", onBack = onBack) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
        ) {
            SegmentedToggle(
                options = listOf(true to "Unpaid", false to "All"),
                selected = unpaidOnly,
                onSelect = { unpaidOnly = it }
            )
            Spacer(Modifier.height(4.dp))

            when (val s = state) {
                is UiState.Loading -> LoadingState()
                is UiState.Error -> ErrorState(message = s.message, onRetry = { viewModel.load(unpaidOnly) })
                is UiState.Success -> {
                    val items = s.data.data
                    if (items.isEmpty()) {
                        EmptyState(icon = Icons.Filled.Savings, message = "No survival benefits found")
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(vertical = 8.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(items, key = { it.id }) { sb ->
                                SBCard(sb = sb, onMarkPaid = { payItem = sb })
                            }
                        }
                    }
                }
            }
        }
    }

    payItem?.let { item ->
        MarkPaidDialog(
            item = item,
            actionState = actionState,
            onDismiss = {
                payItem = null
                viewModel.resetActionState()
            },
            onSubmit = { paidDate, chequeNo ->
                viewModel.markPaid(
                    item.id.toIntOrNull() ?: 0,
                    MarkSBPaidRequest(paidDate = paidDate, chequeNo = chequeNo.takeIf { it.isNotBlank() })
                )
            }
        )
    }
}

@Composable
private fun SBCard(sb: SBItem, onMarkPaid: () -> Unit) {
    val paid = sb.sbPayDate != null
    AccentCard(accentColor = if (paid) SuccessGreen else WarningOrange) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = sb.clientName,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                if (paid) {
                    Badge(text = "Paid ${formatDate(sb.sbPayDate)}", color = SuccessGreen)
                } else {
                    Badge(text = "Unpaid", color = WarningOrange)
                }
            }
            Spacer(Modifier.height(4.dp))
            Text(
                text = "Policy ${sb.policyNo} · instalment ${sb.instalmentNo}",
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
                        text = formatINR(sb.sbAmount),
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "Due ${formatDate(sb.sbDueDate)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                if (!paid) {
                    Button(onClick = onMarkPaid) {
                        Text("Mark Paid")
                    }
                }
            }
    }
}

@Composable
private fun MarkPaidDialog(
    item: SBItem,
    actionState: UiState<*>?,
    onDismiss: () -> Unit,
    onSubmit: (paidDate: String, chequeNo: String) -> Unit
) {
    var paidDate by remember { mutableStateOf("") }
    var chequeNo by remember { mutableStateOf("") }
    val isLoading = actionState is UiState.Loading
    val errorMessage = (actionState as? UiState.Error)?.message

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("Mark Paid · Policy ${item.policyNo}") },
        text = {
            Column(modifier = Modifier.imePadding()) {
                Text(
                    text = "${formatINR(item.sbAmount)} · instalment ${item.instalmentNo}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(Modifier.height(12.dp))
                com.balam.crm.ui.components.DateField(
                    value = paidDate,
                    onValueChange = { paidDate = it },
                    label = "Paid Date *",
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = chequeNo,
                    onValueChange = { chequeNo = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Cheque No (optional)") },
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
                onClick = { onSubmit(paidDate.trim(), chequeNo.trim()) },
                enabled = paidDate.isNotBlank() && !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                } else {
                    Text("Mark Paid")
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
