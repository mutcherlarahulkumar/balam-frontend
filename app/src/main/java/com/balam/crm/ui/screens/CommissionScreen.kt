package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.CreateCommissionRequest
import com.balam.crm.ui.components.*
import com.balam.crm.ui.theme.Primary
import com.balam.crm.viewmodel.CommissionViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun CommissionScreen(vm: CommissionViewModel = hiltViewModel()) {
    val commissionsState by vm.commissions.collectAsStateWithLifecycle()
    val summaryState by vm.summary.collectAsStateWithLifecycle()
    val createState by vm.createState.collectAsStateWithLifecycle()
    var showCreateDialog by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) { vm.load() }
    LaunchedEffect(createState) {
        if (createState is UiState.Success) {
            showCreateDialog = false
            vm.resetCreateState()
            vm.load()
        }
    }

    Scaffold(
        topBar = { CrmTopBar(title = "Commission") },
        floatingActionButton = {
            FloatingActionButton(onClick = { showCreateDialog = true }, containerColor = Primary) {
                Icon(Icons.Filled.Add, contentDescription = "Add", tint = androidx.compose.ui.graphics.Color.White)
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Summary card
            if (summaryState is UiState.Success) {
                val summary = (summaryState as UiState.Success).data
                item {
                    SectionCard("This Month") {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Total Commission", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(
                                    "₹${"%,.2f".format(summary.currentMonth.totalCommission)}",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    color = Primary
                                )
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("Policies Billed", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(
                                    summary.currentMonth.policiesBilled.toString(),
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                if (summary.yearly.isNotEmpty()) {
                    item {
                        SectionCard("Yearly Summary") {
                            summary.yearly.take(3).forEach { yr ->
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("FY ${yr.year}", fontWeight = FontWeight.Medium)
                                    Column(horizontalAlignment = Alignment.End) {
                                        Text("Gross: ₹${"%,.2f".format(yr.gross)}", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold)
                                        Text("1st Year: ₹${"%,.2f".format(yr.firstYear)}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        Text("Renewal: ₹${"%,.2f".format(yr.renewal)}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                                Divider(modifier = Modifier.padding(vertical = 2.dp))
                            }
                        }
                    }
                }
            }

            // Commission list
            when (val s = commissionsState) {
                is UiState.Loading, is UiState.Idle -> item { LoadingBox(Modifier.height(200.dp)) }
                is UiState.Error -> item { ErrorBox(s.message) }
                is UiState.Success -> {
                    val list = s.data.data
                    if (list.isEmpty()) {
                        item { EmptyBox("No commission records found") }
                    } else {
                        item { Text("Commission Records", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold) }
                        items(list) { comm ->
                            Card(modifier = Modifier.fillMaxWidth(), elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text("Policy #${comm.policyNo}", fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyMedium)
                                        comm.billDate?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
                                    }
                                    Spacer(Modifier.height(6.dp))
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                                        if (comm.firstComm > 0) InfoRow("1st", "₹${"%,.2f".format(comm.firstComm)}", Modifier.weight(1f))
                                        if (comm.secondComm > 0) InfoRow("2nd", "₹${"%,.2f".format(comm.secondComm)}", Modifier.weight(1f))
                                        if (comm.thirdComm > 0) InfoRow("3rd", "₹${"%,.2f".format(comm.thirdComm)}", Modifier.weight(1f))
                                    }
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                                        if (comm.bonusComm > 0) InfoRow("Bonus", "₹${"%,.2f".format(comm.bonusComm)}", Modifier.weight(1f))
                                        if (comm.singleComm > 0) InfoRow("Single", "₹${"%,.2f".format(comm.singleComm)}", Modifier.weight(1f))
                                    }
                                    val total = comm.firstComm + comm.secondComm + comm.thirdComm + comm.bonusComm + comm.singleComm + comm.subComm
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                                        Text("Total: ₹${"%,.2f".format(total)}", fontWeight = FontWeight.Bold, color = Primary)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        AddCommissionDialog(
            isLoading = createState is UiState.Loading,
            error = (createState as? UiState.Error)?.message,
            onDismiss = { showCreateDialog = false; vm.resetCreateState() },
            onConfirm = { vm.createCommission(it) }
        )
    }
}

@Composable
fun AddCommissionDialog(
    isLoading: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onConfirm: (CreateCommissionRequest) -> Unit
) {
    var policyNo by remember { mutableStateOf("") }
    var billDate by remember { mutableStateOf("") }
    var firstComm by remember { mutableStateOf("") }
    var secondComm by remember { mutableStateOf("") }
    var bonusComm by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Commission") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(value = policyNo, onValueChange = { policyNo = it }, label = { Text("Policy No *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = billDate, onValueChange = { billDate = it }, label = { Text("Bill Date (YYYY-MM-DD) *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = firstComm, onValueChange = { firstComm = it }, label = { Text("1st Year Commission") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = secondComm, onValueChange = { secondComm = it }, label = { Text("2nd Year Commission") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = bonusComm, onValueChange = { bonusComm = it }, label = { Text("Bonus Commission") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onConfirm(CreateCommissionRequest(
                        policyNo = policyNo.trim().toIntOrNull() ?: 0,
                        billDate = billDate.trim(),
                        firstComm = firstComm.toDoubleOrNull(),
                        secondComm = secondComm.toDoubleOrNull(),
                        bonusComm = bonusComm.toDoubleOrNull()
                    ))
                },
                enabled = policyNo.isNotBlank() && billDate.isNotBlank() && !isLoading
            ) {
                if (isLoading) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                else Text("Add")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}
