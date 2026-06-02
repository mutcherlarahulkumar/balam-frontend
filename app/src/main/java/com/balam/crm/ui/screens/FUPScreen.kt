package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.FUPDueItem
import com.balam.crm.data.model.FUPUpdateRequest
import com.balam.crm.ui.components.*
import com.balam.crm.ui.theme.FUPDue
import com.balam.crm.ui.theme.FUPOverdue
import com.balam.crm.ui.theme.Primary
import com.balam.crm.viewmodel.FUPViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun FUPScreen(vm: FUPViewModel = hiltViewModel()) {
    val fupState by vm.fupList.collectAsStateWithLifecycle()
    val updateState by vm.updateState.collectAsStateWithLifecycle()
    var selectedItem by remember { mutableStateOf<FUPDueItem?>(null) }

    LaunchedEffect(Unit) { vm.loadFUP() }
    LaunchedEffect(updateState) {
        if (updateState is UiState.Success) {
            selectedItem = null
            vm.resetUpdateState()
            vm.loadFUP()
        }
    }

    Scaffold(topBar = { CrmTopBar(title = "FUP Due") }) { padding ->
        when (val s = fupState) {
            is UiState.Loading, is UiState.Idle -> LoadingBox(Modifier.padding(padding))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadFUP() })
            is UiState.Success -> {
                val items = s.data.data
                if (items.isEmpty()) {
                    Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                        Text("No FUP due entries", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize().padding(padding),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        item {
                            Text(
                                "${s.data.total} entries due",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        items(items) { item ->
                            FUPItemCard(item = item, onUpdate = { selectedItem = item })
                        }
                    }
                }
            }
        }
    }

    selectedItem?.let { item ->
        FUPUpdateDialog(
            item = item,
            isLoading = updateState is UiState.Loading,
            error = (updateState as? UiState.Error)?.message,
            onDismiss = {
                selectedItem = null
                vm.resetUpdateState()
            },
            onConfirm = { oldFup, newFup, reason ->
                vm.updateFUP(FUPUpdateRequest(item.policyNo, oldFup, newFup, reason))
            }
        )
    }
}

@Composable
fun FUPItemCard(item: FUPDueItem, onUpdate: () -> Unit) {
    val urgencyColor = if (item.daysOverdue > 0) FUPOverdue else FUPDue
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(item.clientName, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyLarge)
                    Text("Policy #${item.policyNo} • ${item.planName}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (item.daysOverdue > 0) {
                        Surface(
                            color = urgencyColor.copy(alpha = 0.15f),
                            shape = MaterialTheme.shapes.small
                        ) {
                            Text(
                                "${item.daysOverdue}d overdue",
                                color = urgencyColor,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    IconButton(onClick = onUpdate, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Filled.Edit, contentDescription = "Update FUP", tint = Primary)
                    }
                }
            }
            Spacer(Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                InfoRow("Premium", "₹${"%,.2f".format(item.premium)}", Modifier.weight(1f))
                InfoRow("Next Premium", item.nextPremium, Modifier.weight(1f))
            }
            InfoRow("Lapse in", "${item.daysUntilLapse} days")
            item.mobile?.let { InfoRow("Mobile", it) }
        }
    }
}

@Composable
fun FUPUpdateDialog(
    item: FUPDueItem,
    isLoading: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onConfirm: (oldFup: String, newFup: String, reason: String?) -> Unit
) {
    var oldFup by remember { mutableStateOf(item.nextPremium) }
    var newFup by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Update FUP") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Policy #${item.policyNo} – ${item.clientName}", style = MaterialTheme.typography.bodyMedium)
                OutlinedTextField(
                    value = oldFup,
                    onValueChange = { oldFup = it },
                    label = { Text("Current FUP") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = newFup,
                    onValueChange = { newFup = it },
                    label = { Text("New FUP Date (YYYY-MM-DD)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = reason,
                    onValueChange = { reason = it },
                    label = { Text("Reason (optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(oldFup, newFup, reason.ifBlank { null }) },
                enabled = oldFup.isNotBlank() && newFup.isNotBlank() && !isLoading
            ) {
                if (isLoading) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                else Text("Update")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}
