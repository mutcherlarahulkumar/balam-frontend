package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.ui.components.*
import com.balam.crm.ui.theme.Primary
import com.balam.crm.viewmodel.GSTViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun GSTScreen(vm: GSTViewModel = hiltViewModel()) {
    val gstState by vm.gst.collectAsStateWithLifecycle()
    var policyNo by remember { mutableStateOf("") }

    Scaffold(topBar = { CrmTopBar(title = "GST Calculator") }) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = policyNo,
                    onValueChange = { policyNo = it },
                    label = { Text("Policy No") },
                    singleLine = true,
                    modifier = Modifier.weight(1f)
                )
                Button(
                    onClick = {
                        policyNo.trim().toLongOrNull()?.let { vm.calculate(it) }
                    },
                    enabled = policyNo.isNotBlank() && gstState !is UiState.Loading
                ) {
                    Text("Calculate")
                }
            }

            when (val s = gstState) {
                is UiState.Idle -> {
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Enter a policy number above to calculate GST.", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
                is UiState.Loading -> LoadingBox(Modifier.height(200.dp))
                is UiState.Error -> ErrorBox(s.message, onRetry = null)
                is UiState.Success -> {
                    val g = s.data
                    SectionCard("GST Calculation") {
                        InfoRow("Plan No", g.planNo)
                        InfoRow("Plan Name", g.planName)
                        Divider(modifier = Modifier.padding(vertical = 8.dp))
                        InfoRow("Base Premium", "₹${"%,.2f".format(g.basePremium)}")
                        InfoRow("GST Rate", "${g.gstRate}%")
                        InfoRow("GST Amount", "₹${"%,.2f".format(g.gstAmount)}")
                        Divider(modifier = Modifier.padding(vertical = 8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Total Premium", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                            Text(
                                "₹${"%,.2f".format(g.totalPremium)}",
                                fontWeight = FontWeight.Bold,
                                color = Primary,
                                style = MaterialTheme.typography.bodyLarge
                            )
                        }
                    }
                }
            }
        }
    }
}
