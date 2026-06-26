package com.balam.crm.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.FUPDueItem
import com.balam.crm.data.model.FUPUpdateRequest
import com.balam.crm.ui.components.AccentCard
import com.balam.crm.ui.components.Badge
import com.balam.crm.ui.components.EmptyState
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.formatINR
import com.balam.crm.ui.components.ShareButtons
import com.balam.crm.ui.theme.DangerRed
import com.balam.crm.ui.theme.WarningOrange
import com.balam.crm.viewmodel.FUPViewModel
import com.balam.crm.viewmodel.UiState

private val monthNames = listOf(
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FUPScreen(
    onPolicyClick: (Int) -> Unit,
    viewModel: FUPViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val updateState by viewModel.updateState.collectAsStateWithLifecycle()
    var dialogItem by remember { mutableStateOf<FUPDueItem?>(null) }

    var selectedMonth by rememberSaveable { mutableStateOf<Int?>(null) }
    var yearText by rememberSaveable { mutableStateOf("") }
    var overdueOnly by rememberSaveable { mutableStateOf(false) }
    var monthMenuExpanded by remember { mutableStateOf(false) }

    fun reload() {
        viewModel.load(
            year = yearText.trim().toIntOrNull(),
            month = selectedMonth,
            overdueDays = if (overdueOnly) 1 else null
        )
    }

    LaunchedEffect(updateState) {
        if (updateState is UiState.Success) {
            dialogItem = null
            viewModel.resetUpdateState()
            reload()
        }
    }

    Column(modifier = Modifier.fillMaxSize().statusBarsPadding().padding(horizontal = 16.dp)) {
        Spacer(Modifier.height(16.dp))
        Text(
            text = "Premium Due List",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Premiums due and overdue, ready to share with clients",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box {
                FilterChip(
                    selected = selectedMonth != null,
                    onClick = { monthMenuExpanded = true },
                    label = { Text(selectedMonth?.let { monthNames[it - 1] } ?: "Month: All") }
                )
                DropdownMenu(expanded = monthMenuExpanded, onDismissRequest = { monthMenuExpanded = false }) {
                    DropdownMenuItem(text = { Text("All") }, onClick = {
                        selectedMonth = null
                        monthMenuExpanded = false
                        reload()
                    })
                    monthNames.forEachIndexed { index, name ->
                        DropdownMenuItem(text = { Text(name) }, onClick = {
                            selectedMonth = index + 1
                            monthMenuExpanded = false
                            reload()
                        })
                    }
                }
            }
            OutlinedTextField(
                value = yearText,
                onValueChange = {
                    if (it.length <= 4 && it.all { c -> c.isDigit() }) {
                        yearText = it
                        if (it.length == 4 || it.isEmpty()) reload()
                    }
                },
                modifier = Modifier.width(110.dp),
                label = { Text("Year") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
            FilterChip(
                selected = overdueOnly,
                onClick = {
                    overdueOnly = !overdueOnly
                    reload()
                },
                label = { Text("Overdue 1+ days") }
            )
            if (selectedMonth != null || yearText.isNotBlank() || overdueOnly) {
                FilterChip(
                    selected = false,
                    onClick = {
                        selectedMonth = null
                        yearText = ""
                        overdueOnly = false
                        reload()
                    },
                    label = { Text("Clear filters") }
                )
            }
        }
        Spacer(Modifier.height(8.dp))

        when (val s = state) {
            is UiState.Loading -> LoadingState()
            is UiState.Error -> ErrorState(message = s.message, onRetry = { reload() })
            is UiState.Success -> {
                val items = s.data.data
                Text(
                    text = "Total policies: ${items.size}",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
                if (items.isEmpty()) {
                    EmptyState(icon = Icons.Filled.DateRange, message = "No premiums due. All caught up!")
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(items, key = { it.policyNo }) { fup ->
                            FupCard(
                                fup = fup,
                                onClick = { onPolicyClick(fup.policyNo) },
                                onUpdate = { dialogItem = fup }
                            )
                        }
                    }
                }
            }
        }
    }

    dialogItem?.let { item ->
        UpdateFupDialog(
            item = item,
            updateState = updateState,
            onDismiss = {
                dialogItem = null
                viewModel.resetUpdateState()
            },
            onSubmit = { newFup, reason ->
                viewModel.updateFup(
                    FUPUpdateRequest(
                        policyNo = item.policyNo,
                        oldFup = item.nextPremium ?: "",
                        newFup = newFup,
                        reason = reason.takeIf { it.isNotBlank() }
                    )
                )
            }
        )
    }
}

@Composable
private fun FupCard(fup: FUPDueItem, onClick: () -> Unit, onUpdate: () -> Unit) {
    val overdue = fup.daysOverdue > 0
    AccentCard(
        accentColor = if (overdue) DangerRed else WarningOrange,
        onClick = onClick
    ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = fup.clientName,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                if (overdue) {
                    Badge(text = "${fup.daysOverdue}d overdue", color = DangerRed)
                } else {
                    Badge(text = "Due", color = WarningOrange)
                }
            }
            Spacer(Modifier.height(4.dp))
            Text(
                text = "Policy ${fup.policyNo} · ${fup.planName ?: "—"} · ${fup.mobile ?: "no mobile"}",
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
                        text = formatINR(fup.premium),
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "Due ${formatDate(fup.nextPremium)} · lapses in ${fup.daysUntilLapse}d",
                        style = MaterialTheme.typography.bodySmall,
                        color = if (fup.daysUntilLapse <= 7) DangerRed else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                TextButton(onClick = onUpdate) {
                    Text("Update FUP")
                }
            }
            if (!fup.mobile.isNullOrBlank()) {
                Spacer(Modifier.height(8.dp))
                val message = buildString {
                    append("Dear ${fup.clientName},\n\n")
                    append("Your premium payment is due:\n")
                    append("Policy No: ${fup.policyNo}\n")
                    append("Plan: ${fup.planName ?: "—"}\n")
                    append("Premium Amount: ${formatINR(fup.premium)}\n")
                    append("Due Date: ${formatDate(fup.nextPremium)}\n\n")
                    append("Please make the payment at your earliest convenience to keep your policy active.\n\n")
                    append("Regards")
                }
                ShareButtons(mobile = fup.mobile, message = message)
            }
    }
}

@Composable
private fun UpdateFupDialog(
    item: FUPDueItem,
    updateState: UiState<*>?,
    onDismiss: () -> Unit,
    onSubmit: (newFup: String, reason: String) -> Unit
) {
    var newFup by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }
    val isLoading = updateState is UiState.Loading
    val errorMessage = (updateState as? UiState.Error)?.message

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("Update FUP · Policy ${item.policyNo}") },
        text = {
            Column(modifier = Modifier.imePadding()) {
                Text(
                    text = "Current FUP: ${formatDate(item.nextPremium)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(Modifier.height(12.dp))
                com.balam.crm.ui.components.DateField(
                    value = newFup,
                    onValueChange = { newFup = it },
                    label = "New FUP date *",
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = reason,
                    onValueChange = { reason = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Reason (optional)") },
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
                onClick = { onSubmit(newFup.trim(), reason.trim()) },
                enabled = newFup.isNotBlank() && !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                } else {
                    Text("Update")
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
