package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.CreateSBRequest
import com.balam.crm.data.model.SBItem
import com.balam.crm.ui.components.*
import com.balam.crm.ui.theme.FUPPaid
import com.balam.crm.ui.theme.Primary
import com.balam.crm.viewmodel.SBViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun SBScreen(vm: SBViewModel = hiltViewModel()) {
    val sbState by vm.sbList.collectAsStateWithLifecycle()
    val createState by vm.createState.collectAsStateWithLifecycle()
    var showCreateDialog by remember { mutableStateOf(false) }
    var markPaidItem by remember { mutableStateOf<SBItem?>(null) }
    var unpaidOnly by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) { vm.load() }
    LaunchedEffect(createState) {
        if (createState is UiState.Success) {
            showCreateDialog = false
            markPaidItem = null
            vm.resetCreateState()
            vm.load(if (unpaidOnly) true else null)
        }
    }

    Scaffold(
        topBar = { CrmTopBar(title = "Survival Benefits") },
        floatingActionButton = {
            FloatingActionButton(onClick = { showCreateDialog = true }, containerColor = Primary) {
                Icon(Icons.Filled.Add, contentDescription = "Add", tint = Color.White)
            }
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Switch(checked = unpaidOnly, onCheckedChange = {
                    unpaidOnly = it
                    vm.load(if (it) true else null)
                })
                Spacer(Modifier.width(8.dp))
                Text("Unpaid Only", style = MaterialTheme.typography.bodyMedium)
            }

            when (val s = sbState) {
                is UiState.Loading, is UiState.Idle -> LoadingBox()
                is UiState.Error -> ErrorBox(s.message, onRetry = { vm.load() })
                is UiState.Success -> {
                    val list = s.data.data
                    if (list.isEmpty()) EmptyBox("No SB records found")
                    else LazyColumn(
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(list) { item ->
                            SBCard(item = item, onMarkPaid = { markPaidItem = item })
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        AddSBDialog(
            isLoading = createState is UiState.Loading,
            error = (createState as? UiState.Error)?.message,
            onDismiss = { showCreateDialog = false; vm.resetCreateState() },
            onConfirm = { vm.createSB(it) }
        )
    }

    markPaidItem?.let { item ->
        MarkSBPaidDialog(
            item = item,
            isLoading = createState is UiState.Loading,
            error = (createState as? UiState.Error)?.message,
            onDismiss = { markPaidItem = null; vm.resetCreateState() },
            onConfirm = { paidDate, chequeNo -> vm.markPaid(item.id, paidDate, chequeNo) }
        )
    }
}

@Composable
fun SBCard(item: SBItem, onMarkPaid: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth(), elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(item.clientName, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyLarge)
                    Text("Policy #${item.policyNo} • Instalment #${item.instalmentNo}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("₹${"%,.2f".format(item.sbAmount)}", fontWeight = FontWeight.Bold, color = Primary)
                    if (item.sbPayDate != null) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = FUPPaid, modifier = Modifier.size(14.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Paid", style = MaterialTheme.typography.labelSmall, color = FUPPaid)
                        }
                    } else {
                        TextButton(onClick = onMarkPaid, contentPadding = PaddingValues(4.dp)) {
                            Text("Mark Paid", style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
            }
            InfoRow("Due Date", item.sbDueDate)
            item.sbPayDate?.let { InfoRow("Paid Date", it) }
        }
    }
}

@Composable
fun AddSBDialog(
    isLoading: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onConfirm: (CreateSBRequest) -> Unit
) {
    var policyNo by remember { mutableStateOf("") }
    var sbDueDate by remember { mutableStateOf("") }
    var sbAmount by remember { mutableStateOf("") }
    var instalmentNo by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Survival Benefit") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(value = policyNo, onValueChange = { policyNo = it }, label = { Text("Policy No *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = sbDueDate, onValueChange = { sbDueDate = it }, label = { Text("SB Due Date (YYYY-MM-DD) *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = sbAmount, onValueChange = { sbAmount = it }, label = { Text("SB Amount *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = instalmentNo, onValueChange = { instalmentNo = it }, label = { Text("Instalment No *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onConfirm(CreateSBRequest(
                        policyNo = policyNo.trim().toIntOrNull() ?: 0,
                        sbDueDate = sbDueDate.trim(),
                        sbAmount = sbAmount.toDoubleOrNull() ?: 0.0,
                        instalmentNo = instalmentNo.trim().toIntOrNull() ?: 1
                    ))
                },
                enabled = policyNo.isNotBlank() && sbDueDate.isNotBlank() && sbAmount.isNotBlank() && !isLoading
            ) {
                if (isLoading) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                else Text("Add")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun MarkSBPaidDialog(
    item: SBItem,
    isLoading: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onConfirm: (paidDate: String, chequeNo: String?) -> Unit
) {
    var paidDate by remember { mutableStateOf("") }
    var chequeNo by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Mark as Paid") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Policy #${item.policyNo} – ₹${"%,.2f".format(item.sbAmount)}", style = MaterialTheme.typography.bodyMedium)
                OutlinedTextField(value = paidDate, onValueChange = { paidDate = it }, label = { Text("Paid Date (YYYY-MM-DD) *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = chequeNo, onValueChange = { chequeNo = it }, label = { Text("Cheque No (optional)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(paidDate, chequeNo.ifBlank { null }) },
                enabled = paidDate.isNotBlank() && !isLoading
            ) {
                if (isLoading) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                else Text("Confirm")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}
