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
import com.balam.crm.data.model.*
import com.balam.crm.ui.components.*
import com.balam.crm.ui.theme.Primary
import com.balam.crm.viewmodel.ClientsViewModel
import com.balam.crm.viewmodel.FamiliesViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun FamiliesScreen(
    onFamilyClick: (String) -> Unit,
    vm: FamiliesViewModel = hiltViewModel()
) {
    val familiesState by vm.families.collectAsStateWithLifecycle()
    val createState by vm.createState.collectAsStateWithLifecycle()
    var search by remember { mutableStateOf("") }
    var showCreateDialog by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) { vm.loadFamilies() }
    LaunchedEffect(createState) {
        if (createState is UiState.Success) {
            showCreateDialog = false
            vm.resetCreateState()
            vm.loadFamilies()
        }
    }

    Scaffold(
        topBar = { CrmTopBar(title = "Families") },
        floatingActionButton = {
            FloatingActionButton(onClick = { showCreateDialog = true }, containerColor = Primary) {
                Icon(Icons.Filled.Add, contentDescription = "Add Family", tint = androidx.compose.ui.graphics.Color.White)
            }
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            OutlinedTextField(
                value = search,
                onValueChange = {
                    search = it
                    vm.loadFamilies(search = it)
                },
                placeholder = { Text("Search families...") },
                leadingIcon = { Icon(Icons.Filled.Search, null) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(16.dp)
            )
            when (val s = familiesState) {
                is UiState.Loading, is UiState.Idle -> LoadingBox()
                is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadFamilies() })
                is UiState.Success -> {
                    val list = s.data.data
                    if (list.isEmpty()) EmptyBox("No families found")
                    else LazyColumn(
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(list) { family ->
                            Card(
                                modifier = Modifier.fillMaxWidth().clickable { onFamilyClick(family.familyCode) },
                                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(family.headName, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyLarge)
                                        Text("Code: ${family.familyCode}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Column(horizontalAlignment = Alignment.End) {
                                        Text("${family.memberCount} members", style = MaterialTheme.typography.bodySmall)
                                        Text("${family.policyCount} policies", style = MaterialTheme.typography.bodySmall)
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
        CreateFamilyDialog(
            isLoading = createState is UiState.Loading,
            error = (createState as? UiState.Error)?.message,
            onDismiss = { showCreateDialog = false; vm.resetCreateState() },
            onConfirm = { req -> vm.createFamily(req) }
        )
    }
}

@Composable
fun CreateFamilyDialog(
    isLoading: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onConfirm: (CreateFamilyRequest) -> Unit
) {
    var familyCode by remember { mutableStateOf("") }
    var headName by remember { mutableStateOf("") }
    var mobile by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Family") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(value = familyCode, onValueChange = { familyCode = it }, label = { Text("Family Code *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = headName, onValueChange = { headName = it }, label = { Text("Head Name *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = mobile, onValueChange = { mobile = it }, label = { Text("Mobile") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = address, onValueChange = { address = it }, label = { Text("Address") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onConfirm(CreateFamilyRequest(
                        familyCode = familyCode.trim(),
                        headName = headName.trim(),
                        mobile = mobile.ifBlank { null },
                        email = email.ifBlank { null },
                        address = address.ifBlank { null }
                    ))
                },
                enabled = familyCode.isNotBlank() && headName.isNotBlank() && !isLoading
            ) {
                if (isLoading) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                else Text("Create")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun FamilyDetailScreen(
    familyCode: String,
    onBack: () -> Unit,
    onClientClick: (Int) -> Unit,
    onPolicyClick: (Int) -> Unit,
    vm: FamiliesViewModel = hiltViewModel()
) {
    val detailState by vm.familyDetail.collectAsStateWithLifecycle()

    LaunchedEffect(familyCode) { vm.loadFamilyDetail(familyCode) }

    Scaffold(topBar = { CrmTopBar(title = "Family: $familyCode", onBack = onBack) }) { padding ->
        when (val s = detailState) {
            is UiState.Loading, is UiState.Idle -> LoadingBox(Modifier.padding(padding))
            is UiState.Error -> ErrorBox(s.message, onRetry = { vm.loadFamilyDetail(familyCode) })
            is UiState.Success -> {
                val f = s.data
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        SectionCard("Family Info") {
                            InfoRow("Head Name", f.headName)
                            InfoRow("Family Code", f.familyCode)
                            InfoRow("Mobile", f.mobile)
                            InfoRow("Email", f.email)
                            InfoRow("Address", f.address)
                        }
                    }
                    if (f.members.isNotEmpty()) {
                        item { Text("Members (${f.members.size})", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold) }
                        items(f.members) { client ->
                            Card(
                                modifier = Modifier.fillMaxWidth().clickable { onClientClick(client.id) },
                                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(client.name, fontWeight = FontWeight.Medium, style = MaterialTheme.typography.bodyMedium)
                                        Text("${client.clientType ?: "Client"} • ${client.sex ?: ""}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    client.mobile?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
                                }
                            }
                        }
                    }
                    if (f.policies.isNotEmpty()) {
                        item { Text("Policies (${f.policies.size})", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold) }
                        items(f.policies) { policy ->
                            PolicyCard(policy = policy, onClick = { onPolicyClick(policy.policyNo) })
                        }
                    }
                }
            }
        }
    }
}
