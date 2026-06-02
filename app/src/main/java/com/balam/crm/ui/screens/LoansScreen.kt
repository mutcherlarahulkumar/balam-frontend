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
import com.balam.crm.data.model.CreateLoanRequest
import com.balam.crm.ui.components.*
import com.balam.crm.ui.theme.Primary
import com.balam.crm.viewmodel.LoansViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun LoansScreen(vm: LoansViewModel = hiltViewModel()) {
    val loansState by vm.loans.collectAsStateWithLifecycle()
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
        topBar = { CrmTopBar(title = "Loans") },
        floatingActionButton = {
            FloatingActionButton(onClick = { showCreateDialog = true }, containerColor = Primary) {
                Icon(Icons.Filled.Add, contentDescription = "Add", tint = androidx.compose.ui.graphics.Color.White)
            }
        }
    ) { padding ->
        when (val s = loansState) {
            is UiState.Loading, is UiState.Idle -> LoadingBox(Modifier.padding(padding))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.load() })
            is UiState.Success -> {
                val list = s.data.data
                if (list.isEmpty()) EmptyBox("No loans found")
                else LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(list) { loan ->
                        Card(modifier = Modifier.fillMaxWidth(), elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Policy #${loan.policyNo}", fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyLarge)
                                    Text("₹${"%,d".format(loan.loanAmount)}", fontWeight = FontWeight.Bold, color = Primary, style = MaterialTheme.typography.bodyLarge)
                                }
                                Spacer(Modifier.height(8.dp))
                                InfoRow("Loan Date", loan.loanDate)
                                InfoRow("Interest Due Date", loan.interestDueDate)
                            }
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        AddLoanDialog(
            isLoading = createState is UiState.Loading,
            error = (createState as? UiState.Error)?.message,
            onDismiss = { showCreateDialog = false; vm.resetCreateState() },
            onConfirm = { vm.createLoan(it) }
        )
    }
}

@Composable
fun AddLoanDialog(
    isLoading: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onConfirm: (CreateLoanRequest) -> Unit
) {
    var policyNo by remember { mutableStateOf("") }
    var loanDate by remember { mutableStateOf("") }
    var loanAmount by remember { mutableStateOf("") }
    var interestDueDate by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Loan") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(value = policyNo, onValueChange = { policyNo = it }, label = { Text("Policy No *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = loanDate, onValueChange = { loanDate = it }, label = { Text("Loan Date (YYYY-MM-DD) *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = loanAmount, onValueChange = { loanAmount = it }, label = { Text("Loan Amount *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = interestDueDate, onValueChange = { interestDueDate = it }, label = { Text("Interest Due Date (YYYY-MM-DD) *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onConfirm(CreateLoanRequest(
                        policyNo = policyNo.trim().toIntOrNull() ?: 0,
                        loanDate = loanDate.trim(),
                        loanAmount = loanAmount.toIntOrNull() ?: 0,
                        interestDueDate = interestDueDate.trim()
                    ))
                },
                enabled = policyNo.isNotBlank() && loanDate.isNotBlank() && loanAmount.isNotBlank() && interestDueDate.isNotBlank() && !isLoading
            ) {
                if (isLoading) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                else Text("Add")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}
