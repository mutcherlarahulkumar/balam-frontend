package com.balam.crm.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.Client
import com.balam.crm.data.model.FamilyListItem
import com.balam.crm.data.model.PolicyListItem
import com.balam.crm.viewmodel.SearchViewModel
import com.balam.crm.viewmodel.UiState
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    onBack: () -> Unit,
    onFamilyClick: (String) -> Unit,
    onClientClick: (Int) -> Unit,
    onPolicyClick: (Int) -> Unit,
    viewModel: SearchViewModel = hiltViewModel()
) {
    var query by remember { mutableStateOf("") }
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(query) {
        if (query.isBlank()) {
            viewModel.clear()
        } else {
            delay(400)
            viewModel.search(query)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Search") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(modifier = Modifier.fillMaxSize().padding(innerPadding).padding(16.dp)) {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Families, clients, policies...") },
                singleLine = true,
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) }
            )
            Spacer(Modifier.height(16.dp))
            when (val s = state) {
                null -> Text(
                    text = "Type at least 2 characters to search.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                is UiState.Loading -> CircularProgressIndicator(modifier = Modifier.padding(top = 24.dp))
                is UiState.Error -> Text(
                    text = s.message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error
                )
                is UiState.Success -> {
                    val data = s.data
                    if (data.families.isEmpty() && data.clients.isEmpty() && data.policies.isEmpty()) {
                        Text(
                            text = "No results found.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    } else {
                        LazyColumn(
                            contentPadding = PaddingValues(bottom = 16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            if (data.families.isNotEmpty()) {
                                item { SectionLabel("Families") }
                                items(data.families, key = { "family-${it.id}" }) { family ->
                                    SearchResultCard(
                                        icon = Icons.Filled.Groups,
                                        title = family.headName ?: "—",
                                        subtitle = "Family ${family.familyCode}",
                                        onClick = { onFamilyClick(family.familyCode) }
                                    )
                                }
                            }
                            if (data.clients.isNotEmpty()) {
                                item { SectionLabel("Clients") }
                                items(data.clients, key = { "client-${it.id}" }) { client ->
                                    SearchResultCard(
                                        icon = Icons.Filled.Person,
                                        title = client.name ?: "—",
                                        subtitle = client.mobile ?: "—",
                                        onClick = { onClientClick(client.id) }
                                    )
                                }
                            }
                            if (data.policies.isNotEmpty()) {
                                item { SectionLabel("Policies") }
                                items(data.policies, key = { "policy-${it.policyNo}" }) { policy ->
                                    SearchResultCard(
                                        icon = Icons.Filled.Description,
                                        title = "Policy ${policy.policyNo}",
                                        subtitle = "${policy.clientName} · ${policy.planName ?: "—"}",
                                        onClick = { onPolicyClick(policy.policyNo) }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SectionLabel(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelLarge,
        color = MaterialTheme.colorScheme.primary
    )
}

@Composable
private fun SearchResultCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Column(modifier = Modifier.padding(start = 12.dp)) {
                Text(text = title, style = MaterialTheme.typography.titleSmall)
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
