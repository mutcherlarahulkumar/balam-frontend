package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.CreateLoanRequest
import com.balam.crm.data.model.Loan
import com.balam.crm.ui.components.EmptyState
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.formatINR
import com.balam.crm.viewmodel.LoansViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun LoansScreen(
    onBack: () -> Unit,
    viewModel: LoansViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val createState by viewModel.createState.collectAsStateWithLifecycle()
    var showCreateDialog by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(createState) {
        if (createState is UiState.Success) {
            showCreateDialog = false
            viewModel.resetCreateState()
            viewModel.load()
        }
    }

    Scaffold(
        topBar = { BackTopBar(title = "Policy Loans", onBack = onBack) },
        floatingActionButton = {
            FloatingActionButton(onClick = { showCreateDialog = true }) {
                Icon(Icons.Filled.Add, contentDescription = "Add loan")
            }
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        when (val s = state) {
            is UiState.Loading -> LoadingState(modifier = Modifier.padding(padding))
            is UiState.Error -> ErrorState(
                message = s.message,
                onRetry = { viewModel.load() },
                modifier = Modifier.padding(padding)
            )
            is UiState.Success -> {
                val loans = s.data.data
                if (loans.isEmpty()) {
                    EmptyState(
                        icon = Icons.Filled.AccountBalance,
                        message = "No loans recorded",
                        modifier = Modifier.padding(padding)
                    )
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(padding),
                        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 88.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(loans, key = { it.id }) { loan ->
                            LoanCard(loan = loan)
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        CreateLoanDialog(
            createState = createState,
            onDismiss = {
                showCreateDialog = false
                viewModel.resetCreateState()
            },
            onSubmit = { viewModel.create(it) }
        )
    }
}

@Composable
private fun LoanCard(loan: Loan) {
    Card(
        modifier = Modifier.fillMaxWidth(),
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
                    text = "Policy ${loan.policyNo}",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = formatINR(loan.loanAmount.toDouble()),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            Spacer(Modifier.height(4.dp))
            Text(
                text = "Taken ${formatDate(loan.loanDate)} · interest due ${formatDate(loan.interestDueDate)}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            loan.loanInterest?.let {
                Text(
                    text = "Interest: ${formatINR(it.toDouble())}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            if (!loan.details.isNullOrBlank()) {
                Spacer(Modifier.height(4.dp))
                Text(
                    text = loan.details,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun CreateLoanDialog(
    createState: UiState<*>?,
    onDismiss: () -> Unit,
    onSubmit: (CreateLoanRequest) -> Unit
) {
    var policyNo by remember { mutableStateOf("") }
    var loanDate by remember { mutableStateOf("") }
    var loanAmount by remember { mutableStateOf("") }
    var interestDueDate by remember { mutableStateOf("") }
    val isLoading = createState is UiState.Loading
    val errorMessage = (createState as? UiState.Error)?.message
    val valid = policyNo.toIntOrNull() != null && loanDate.isNotBlank() &&
        loanAmount.toIntOrNull() != null && interestDueDate.isNotBlank()

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("New Loan") },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                OutlinedTextField(
                    value = policyNo,
                    onValueChange = { policyNo = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Policy No *") },
                    singleLine = true,
                    enabled = !isLoading,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = loanAmount,
                    onValueChange = { loanAmount = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Loan Amount (₹) *") },
                    singleLine = true,
                    enabled = !isLoading,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                Spacer(Modifier.height(8.dp))
                com.balam.crm.ui.components.DateField(
                    value = loanDate,
                    onValueChange = { loanDate = it },
                    label = "Loan Date *",
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                com.balam.crm.ui.components.DateField(
                    value = interestDueDate,
                    onValueChange = { interestDueDate = it },
                    label = "Interest Due Date *",
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
                onClick = {
                    onSubmit(
                        CreateLoanRequest(
                            policyNo = policyNo.toIntOrNull() ?: 0,
                            loanDate = loanDate.trim(),
                            loanAmount = loanAmount.toIntOrNull() ?: 0,
                            interestDueDate = interestDueDate.trim()
                        )
                    )
                },
                enabled = valid && !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                } else {
                    Text("Create")
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
