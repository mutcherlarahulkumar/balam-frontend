package com.balam.crm.ui.screens

import androidx.compose.foundation.clickable
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.Client
import com.balam.crm.data.model.ClientDetail
import com.balam.crm.data.model.CreateClientRequest
import com.balam.crm.ui.components.*
import com.balam.crm.ui.theme.Primary
import com.balam.crm.viewmodel.ClientsViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun ClientsScreen(
    onClientClick: (Int) -> Unit,
    vm: ClientsViewModel = hiltViewModel()
) {
    val clientsState by vm.clients.collectAsStateWithLifecycle()
    val createState by vm.createState.collectAsStateWithLifecycle()
    var search by remember { mutableStateOf("") }
    var showCreateDialog by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) { vm.loadClients() }
    LaunchedEffect(createState) {
        if (createState is UiState.Success) {
            showCreateDialog = false
            vm.resetCreateState()
            vm.loadClients()
        }
    }

    Scaffold(
        topBar = { CrmTopBar(title = "Clients") },
        floatingActionButton = {
            FloatingActionButton(onClick = { showCreateDialog = true }, containerColor = Primary) {
                Icon(Icons.Filled.Add, contentDescription = "Add Client", tint = androidx.compose.ui.graphics.Color.White)
            }
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            OutlinedTextField(
                value = search,
                onValueChange = {
                    search = it
                    vm.loadClients(search = it)
                },
                placeholder = { Text("Search clients...") },
                leadingIcon = { Icon(Icons.Filled.Search, null) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(16.dp)
            )
            when (val s = clientsState) {
                is UiState.Loading, is UiState.Idle -> LoadingBox()
                is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadClients() })
                is UiState.Success -> {
                    val list = s.data.data
                    if (list.isEmpty()) EmptyBox("No clients found")
                    else LazyColumn(
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(list) { client ->
                            ClientCard(client = client, onClick = { onClientClick(client.id) })  // id is Int
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        CreateClientDialog(
            isLoading = createState is UiState.Loading,
            error = (createState as? UiState.Error)?.message,
            onDismiss = { showCreateDialog = false; vm.resetCreateState() },
            onConfirm = { req -> vm.createClient(req) }
        )
    }
}

@Composable
fun ClientCard(client: Client, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(client.name, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyLarge)
                Text(
                    "${client.clientType ?: "Client"} • Family: ${client.familyCode}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                client.occupation?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                client.mobile?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
                client.age?.let { Text("Age: $it", style = MaterialTheme.typography.bodySmall) }
            }
        }
    }
}

@Composable
fun CreateClientDialog(
    isLoading: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onConfirm: (CreateClientRequest) -> Unit
) {
    var familyCode by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var mobile by remember { mutableStateOf("") }
    var dob by remember { mutableStateOf("") }
    var sex by remember { mutableStateOf("") }
    var occupation by remember { mutableStateOf("") }
    var clientType by remember { mutableStateOf("C") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Client") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(value = familyCode, onValueChange = { familyCode = it }, label = { Text("Family Code *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Name *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = mobile, onValueChange = { mobile = it }, label = { Text("Mobile") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = dob, onValueChange = { dob = it }, label = { Text("DOB (YYYY-MM-DD)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("M", "F").forEach { s ->
                        FilterChip(selected = sex == s, onClick = { sex = s }, label = { Text(if (s == "M") "Male" else "Female") })
                    }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("C" to "Client", "P" to "Proposer", "N" to "Nominee").forEach { (value, label) ->
                        FilterChip(selected = clientType == value, onClick = { clientType = value }, label = { Text(label) })
                    }
                }
                OutlinedTextField(value = occupation, onValueChange = { occupation = it }, label = { Text("Occupation") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onConfirm(CreateClientRequest(
                        familyCode = familyCode.trim(),
                        name = name.trim(),
                        mobile = mobile.ifBlank { null },
                        dob = dob.ifBlank { null },
                        sex = sex.ifBlank { null },
                        occupation = occupation.ifBlank { null },
                        clientType = clientType
                    ))
                },
                enabled = familyCode.isNotBlank() && name.isNotBlank() && !isLoading
            ) {
                if (isLoading) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                else Text("Create")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun ClientDetailScreen(
    id: Int,
    onBack: () -> Unit,
    vm: ClientsViewModel = hiltViewModel()
) {
    val detailState by vm.clientDetail.collectAsStateWithLifecycle()

    LaunchedEffect(id) { vm.loadClientDetail(id) }

    Scaffold(topBar = { CrmTopBar(title = "Client Details", onBack = onBack) }) { padding ->
        when (val s = detailState) {
            is UiState.Loading, is UiState.Idle -> LoadingBox(Modifier.padding(padding))
            is UiState.Error -> ErrorBox(s.message)
            is UiState.Success -> {
                val c = s.data
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Primary)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(c.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = androidx.compose.ui.graphics.Color.White)
                                Text("${c.clientType ?: "Client"} • ${c.sex ?: ""}", style = MaterialTheme.typography.bodyMedium, color = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.8f))
                            }
                        }
                    }
                    item {
                        SectionCard("Personal Info") {
                            InfoRow("Family Code", c.familyCode)
                            InfoRow("Pers Code", c.persCode)
                            InfoRow("Date of Birth", c.dob)
                            InfoRow("Age", c.age?.toString())
                            InfoRow("Sex", c.sex)
                            InfoRow("Occupation", c.occupation)
                        }
                    }
                    item {
                        SectionCard("Contact") {
                            InfoRow("Mobile", c.mobile)
                            InfoRow("Email", c.email)
                            InfoRow("Address", c.address)
                        }
                    }
                    if (c.policies.isNotEmpty()) {
                        item { Text("Policies (${c.policies.size})", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold) }
                        items(c.policies) { policy ->
                            PolicyCard(policy = policy, onClick = {})
                        }
                    }
                }
            }
        }
    }
}
