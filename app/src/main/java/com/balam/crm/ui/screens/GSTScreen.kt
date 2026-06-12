package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.ui.components.EmptyState
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.InfoRow
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SectionCard
import com.balam.crm.ui.components.formatINR
import com.balam.crm.viewmodel.GSTViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun GSTScreen(
    onBack: () -> Unit,
    viewModel: GSTViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var policyNo by rememberSaveable { mutableStateOf("") }
    val isLoading = state is UiState.Loading

    Scaffold(
        topBar = { BackTopBar(title = "GST Calculator", onBack = onBack) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            Text(
                text = "Calculate GST applicable on a policy premium",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = policyNo,
                onValueChange = { policyNo = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Policy Number") },
                singleLine = true,
                enabled = !isLoading,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
            Spacer(Modifier.height(12.dp))
            Button(
                onClick = { policyNo.trim().toIntOrNull()?.let { viewModel.calculate(it) } },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                enabled = policyNo.trim().toIntOrNull() != null && !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(22.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Icon(Icons.Filled.Calculate, contentDescription = null)
                    Spacer(Modifier.size(8.dp))
                    Text("Calculate GST")
                }
            }
            Spacer(Modifier.height(16.dp))

            when (val s = state) {
                null -> EmptyState(
                    icon = Icons.Filled.Calculate,
                    message = "Enter a policy number to calculate GST",
                    modifier = Modifier.height(280.dp)
                )
                is UiState.Loading -> LoadingState(modifier = Modifier.height(280.dp))
                is UiState.Error -> ErrorState(
                    message = s.message,
                    onRetry = { policyNo.trim().toIntOrNull()?.let { viewModel.calculate(it) } },
                    modifier = Modifier.height(280.dp)
                )
                is UiState.Success -> {
                    val gst = s.data
                    SectionCard(title = "GST Breakdown") {
                        InfoRow("Policy No", gst.policyNo?.toString())
                        InfoRow("Plan No", gst.planNo)
                        InfoRow("Plan Type", gst.planType)
                        InfoRow("Premium Year", gst.premiumYear?.toString())
                        InfoRow("Base Premium", formatINR(gst.basePremium), emphasize = true)
                        InfoRow("GST Rate", "${gst.gstRate}%")
                        InfoRow("GST Amount", formatINR(gst.gstAmount), emphasize = true)
                        InfoRow("Total Premium", formatINR(gst.totalPremium), emphasize = true)
                    }
                    if (!gst.regulation.isNullOrBlank() || !gst.historicalNote.isNullOrBlank()) {
                        Spacer(Modifier.height(12.dp))
                        SectionCard(title = "Notes") {
                            if (!gst.regulation.isNullOrBlank()) {
                                Text(
                                    text = gst.regulation,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(vertical = 4.dp)
                                )
                            }
                            if (!gst.historicalNote.isNullOrBlank()) {
                                Text(
                                    text = gst.historicalNote,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(vertical = 4.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
