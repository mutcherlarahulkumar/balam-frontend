package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.CreateLeadRequest
import com.balam.crm.data.model.Lead
import com.balam.crm.ui.components.*
import com.balam.crm.ui.theme.Primary
import com.balam.crm.viewmodel.LeadsViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun LeadsScreen(vm: LeadsViewModel = hiltViewModel()) {
    val leadsState by vm.leads.collectAsStateWithLifecycle()
    val createState by vm.createState.collectAsStateWithLifecycle()
    var search by remember { mutableStateOf("") }
    var showCreateDialog by remember { mutableStateOf(false) }
    var editingLead by remember { mutableStateOf<Lead?>(null) }

    LaunchedEffect(Unit) { vm.load() }
    LaunchedEffect(createState) {
        if (createState is UiState.Success) {
            showCreateDialog = false
            editingLead = null
            vm.resetCreateState()
            vm.load()
        }
    }

    Scaffold(
        topBar = { CrmTopBar(title = "Leads") },
        floatingActionButton = {
            FloatingActionButton(onClick = { showCreateDialog = true }, containerColor = Primary) {
                Icon(Icons.Filled.Add, contentDescription = "Add Lead", tint = Color.White)
            }
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            OutlinedTextField(
                value = search,
                onValueChange = { search = it; vm.load(it) },
                placeholder = { Text("Search leads...") },
                leadingIcon = { Icon(Icons.Filled.Search, null) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(16.dp)
            )
            when (val s = leadsState) {
                is UiState.Loading, is UiState.Idle -> LoadingBox()
                is UiState.Error -> ErrorBox(s.message, onRetry = { vm.load() })
                is UiState.Success -> {
                    val list = s.data.data
                    if (list.isEmpty()) EmptyBox("No leads found")
                    else LazyColumn(
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(list) { lead ->
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
                                        Text(lead.name, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
                                        TextButton(onClick = { editingLead = lead }, contentPadding = PaddingValues(4.dp)) {
                                            Text("Edit", style = MaterialTheme.typography.labelSmall)
                                        }
                                    }
                                    lead.mobile?.let { InfoRow("Mobile", it) }
                                    lead.address?.let { InfoRow("Address", it) }
                                    lead.searchTerm?.let { InfoRow("Search Term", it) }
                                    Text(
                                        "Added: ${lead.createdAt.take(10)}",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog || editingLead != null) {
        LeadDialog(
            lead = editingLead,
            isLoading = createState is UiState.Loading,
            error = (createState as? UiState.Error)?.message,
            onDismiss = {
                showCreateDialog = false
                editingLead = null
                vm.resetCreateState()
            },
            onConfirm = { req ->
                editingLead?.let { vm.updateLead(it.id.toInt(), req) } ?: vm.createLead(req)
            }
        )
    }
}

@Composable
fun LeadDialog(
    lead: Lead?,
    isLoading: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onConfirm: (CreateLeadRequest) -> Unit
) {
    var name by remember(lead) { mutableStateOf(lead?.name ?: "") }
    var mobile by remember(lead) { mutableStateOf(lead?.mobile ?: "") }
    var address by remember(lead) { mutableStateOf(lead?.address ?: "") }
    var searchTerm by remember(lead) { mutableStateOf(lead?.searchTerm ?: "") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (lead == null) "Add Lead" else "Edit Lead") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Name *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = mobile, onValueChange = { mobile = it }, label = { Text("Mobile") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = address, onValueChange = { address = it }, label = { Text("Address") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = searchTerm, onValueChange = { searchTerm = it }, label = { Text("Search Term") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onConfirm(CreateLeadRequest(
                        name = name.trim(),
                        mobile = mobile.ifBlank { null },
                        address = address.ifBlank { null },
                        searchTerm = searchTerm.ifBlank { null }
                    ))
                },
                enabled = name.isNotBlank() && !isLoading
            ) {
                if (isLoading) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                else Text(if (lead == null) "Add" else "Save")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}
