package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.CreatePolicyRequest
import com.balam.crm.viewmodel.PoliciesViewModel
import com.balam.crm.viewmodel.UiState

/**
 * Full-screen policy creation form, used when navigating from a client or family so that
 * familyCode / persCode can be pre-filled (and locked when provided). Shares the
 * PoliciesViewModel and the PlanPickerField from PoliciesScreen.
 */
@Composable
fun CreatePolicyScreen(
    prefillFamilyCode: String,
    prefillPersCode: String,
    onBack: () -> Unit,
    onCreated: () -> Unit,
    viewModel: PoliciesViewModel = hiltViewModel()
) {
    val createState by viewModel.createState.collectAsStateWithLifecycle()
    val plans by viewModel.plans.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModel.loadPlans()
        viewModel.resetCreateState()
    }

    LaunchedEffect(createState) {
        if (createState is UiState.Success) {
            viewModel.resetCreateState()
            onCreated()
        }
    }

    var policyNo by remember { mutableStateOf("") }
    var familyCode by remember { mutableStateOf(prefillFamilyCode) }
    var persCode by remember { mutableStateOf(prefillPersCode) }
    var planNo by remember { mutableStateOf("") }
    var issueDate by remember { mutableStateOf("") }
    var matDate by remember { mutableStateOf("") }
    var term by remember { mutableStateOf("") }
    var ppt by remember { mutableStateOf("") }
    var sumAssured by remember { mutableStateOf("") }
    var premium by remember { mutableStateOf("") }
    var paymentMode by remember { mutableStateOf("") }
    var nextPremium by remember { mutableStateOf("") }
    var nominee by remember { mutableStateOf("") }
    var relation by remember { mutableStateOf("") }
    var branch by remember { mutableStateOf("") }
    var neft by remember { mutableStateOf("") }
    var dab by remember { mutableStateOf("") }
    var termRider by remember { mutableStateOf("") }

    val familyLocked = prefillFamilyCode.isNotBlank()
    val persLocked = prefillPersCode.isNotBlank()

    val isLoading = createState is UiState.Loading
    val errorMessage = (createState as? UiState.Error)?.message

    val isValid = policyNo.toIntOrNull() != null &&
        familyCode.isNotBlank() &&
        persCode.isNotBlank() &&
        planNo.isNotBlank() &&
        issueDate.isNotBlank() &&
        matDate.isNotBlank() &&
        term.toIntOrNull() != null &&
        ppt.toIntOrNull() != null &&
        sumAssured.toDoubleOrNull() != null &&
        premium.toDoubleOrNull() != null &&
        paymentMode.isNotBlank() &&
        nextPremium.isNotBlank() &&
        nominee.isNotBlank() &&
        relation.isNotBlank()

    Scaffold(
        topBar = { BackTopBar(title = "New Policy", onBack = onBack) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .imePadding()
                .padding(16.dp)
        ) {
            OutlinedTextField(
                value = policyNo,
                onValueChange = { policyNo = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Policy No *") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = familyCode,
                onValueChange = { familyCode = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Family Code *") },
                singleLine = true,
                enabled = !isLoading && !familyLocked
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = persCode,
                onValueChange = { persCode = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Person Code *") },
                singleLine = true,
                enabled = !isLoading && !persLocked
            )
            Spacer(Modifier.height(8.dp))
            PlanPickerField(
                planNo = planNo,
                onPlanNoChange = { planNo = it },
                plans = plans,
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            com.balam.crm.ui.components.DateField(
                value = issueDate,
                onValueChange = { issueDate = it },
                label = "Issue Date *",
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            com.balam.crm.ui.components.DateField(
                value = matDate,
                onValueChange = { matDate = it },
                label = "Maturity Date *",
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = term,
                onValueChange = { term = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Term *") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = ppt,
                onValueChange = { ppt = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("PPT *") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = sumAssured,
                onValueChange = { sumAssured = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Sum Assured *") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = premium,
                onValueChange = { premium = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Premium *") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = paymentMode,
                onValueChange = { paymentMode = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Payment Mode *") },
                placeholder = { Text("Y/H/Q/M/S") },
                singleLine = true,
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            com.balam.crm.ui.components.DateField(
                value = nextPremium,
                onValueChange = { nextPremium = it },
                label = "Next Premium *",
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = nominee,
                onValueChange = { nominee = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Nominee *") },
                singleLine = true,
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = relation,
                onValueChange = { relation = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Relation *") },
                singleLine = true,
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = branch,
                onValueChange = { branch = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Branch") },
                singleLine = true,
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = neft,
                onValueChange = { neft = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("NEFT") },
                singleLine = true,
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = dab,
                onValueChange = { dab = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("DAB") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                enabled = !isLoading
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = termRider,
                onValueChange = { termRider = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Term Rider") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
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
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = {
                    viewModel.createPolicy(
                        CreatePolicyRequest(
                            policyNo = policyNo.trim().toInt(),
                            familyCode = familyCode.trim(),
                            persCode = persCode.trim(),
                            planNo = planNo.trim(),
                            issueDate = issueDate.trim(),
                            matDate = matDate.trim(),
                            term = term.trim().toInt(),
                            ppt = ppt.trim().toInt(),
                            sumAssured = sumAssured.trim().toDouble(),
                            premium = premium.trim().toDouble(),
                            paymentMode = paymentMode.trim(),
                            nextPremium = nextPremium.trim(),
                            nominee = nominee.trim(),
                            relation = relation.trim(),
                            branch = branch.trim().takeIf { it.isNotBlank() },
                            neft = neft.trim().takeIf { it.isNotBlank() },
                            dab = dab.trim().toIntOrNull(),
                            termRider = termRider.trim().toIntOrNull()
                        )
                    )
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = isValid && !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                } else {
                    Text("Create Policy")
                }
            }
            Spacer(Modifier.height(24.dp))
        }
    }
}
