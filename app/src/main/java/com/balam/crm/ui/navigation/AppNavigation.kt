package com.balam.crm.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.WindowInsets
import androidx.navigation.NavController
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.balam.crm.data.api.TokenStore
import com.balam.crm.ui.screens.ActivitiesScreen
import com.balam.crm.ui.screens.ClientDetailScreen
import com.balam.crm.ui.screens.ClientsScreen
import com.balam.crm.ui.screens.CommissionScreen
import com.balam.crm.ui.screens.CreatePolicyScreen
import com.balam.crm.ui.screens.DashboardScreen
import com.balam.crm.ui.screens.FUPScreen
import com.balam.crm.ui.screens.FamiliesScreen
import com.balam.crm.ui.screens.FamilyDetailScreen
import com.balam.crm.ui.screens.GSTScreen
import com.balam.crm.ui.screens.LeadsScreen
import com.balam.crm.ui.screens.LoansScreen
import com.balam.crm.ui.screens.LoginScreen
import com.balam.crm.ui.screens.MoreScreen
import com.balam.crm.ui.screens.PoliciesScreen
import com.balam.crm.ui.screens.PolicyDetailScreen
import com.balam.crm.ui.screens.ProfileScreen
import com.balam.crm.ui.screens.RegisterScreen
import com.balam.crm.ui.screens.ReportsScreen
import com.balam.crm.ui.screens.SBScreen
import com.balam.crm.ui.screens.SearchScreen

object Routes {
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val DASHBOARD = "dashboard"
    const val POLICIES = "policies"
    const val FUP = "fup"
    const val FAMILIES = "families"
    const val MORE = "more"
    const val CLIENTS = "clients"
    const val COMMISSION = "commission"
    const val LOANS = "loans"
    const val SB = "sb"
    const val LEADS = "leads"
    const val ACTIVITIES = "activities"
    const val GST = "gst"
    const val REPORTS = "reports"
    const val PROFILE = "profile"
    const val POLICY_NEW = "policy/new"
    const val SEARCH = "search"

    fun policyDetail(policyNo: Int) = "policy/$policyNo"
    fun familyDetail(familyCode: String) = "family/$familyCode"
    fun clientDetail(id: Int) = "client/$id"
    fun createPolicy(familyCode: String, persCode: String) =
        "policy/new?familyCode=$familyCode&persCode=$persCode"
}

private data class BottomTab(val route: String, val label: String, val icon: ImageVector)

fun NavController.navigateToTab(route: String) {
    navigate(route) {
        popUpTo(graph.findStartDestination().id) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}

private val bottomTabs = listOf(
    BottomTab(Routes.DASHBOARD, "Dashboard", Icons.Filled.Home),
    BottomTab(Routes.POLICIES, "Policies", Icons.Filled.Description),
    BottomTab(Routes.FUP, "Due List", Icons.Filled.DateRange),
    BottomTab(Routes.FAMILIES, "Families", Icons.Filled.Groups),
    BottomTab(Routes.MORE, "More", Icons.Filled.MoreHoriz)
)

@Composable
fun AppNavigation(tokenStore: TokenStore) {
    val navController = rememberNavController()
    val startDestination = remember { if (tokenStore.isLoggedIn()) Routes.DASHBOARD else Routes.LOGIN }
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val showBottomBar = currentRoute in bottomTabs.map { it.route }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    bottomTabs.forEach { tab ->
                        NavigationBarItem(
                            selected = currentRoute == tab.route,
                            onClick = {
                                navController.navigateToTab(tab.route)
                            },
                            icon = { Icon(tab.icon, contentDescription = tab.label) },
                            label = { Text(tab.label) }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Routes.LOGIN) {
                LoginScreen(
                    onLoginSuccess = {
                        navController.navigate(Routes.DASHBOARD) {
                            popUpTo(0) { inclusive = true }
                        }
                    },
                    onRegisterClick = { navController.navigate(Routes.REGISTER) }
                )
            }
            composable(Routes.REGISTER) {
                RegisterScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.DASHBOARD) {
                DashboardScreen(
                    onPolicyClick = { navController.navigate(Routes.policyDetail(it)) },
                    onNavigate = { route ->
                        if (route in bottomTabs.map { it.route }) {
                            navController.navigateToTab(route)
                        } else {
                            navController.navigate(route)
                        }
                    }
                )
            }
            composable(Routes.POLICIES) {
                PoliciesScreen(onPolicyClick = { navController.navigate(Routes.policyDetail(it)) })
            }
            composable(
                route = "policy/new?familyCode={familyCode}&persCode={persCode}",
                arguments = listOf(
                    navArgument("familyCode") { type = NavType.StringType; defaultValue = "" },
                    navArgument("persCode") { type = NavType.StringType; defaultValue = "" }
                )
            ) { entry ->
                val familyCode = entry.arguments?.getString("familyCode") ?: ""
                val persCode = entry.arguments?.getString("persCode") ?: ""
                CreatePolicyScreen(
                    prefillFamilyCode = familyCode,
                    prefillPersCode = persCode,
                    onBack = { navController.popBackStack() },
                    onCreated = { navController.popBackStack() }
                )
            }
            composable("policy/{policyNo}") { entry ->
                val policyNo = entry.arguments?.getString("policyNo")?.toIntOrNull() ?: 0
                PolicyDetailScreen(
                    policyNo = policyNo,
                    onBack = { navController.popBackStack() },
                    onViewFamily = { navController.navigate(Routes.familyDetail(it)) }
                )
            }
            composable(Routes.FUP) {
                FUPScreen(onPolicyClick = { navController.navigate(Routes.policyDetail(it)) })
            }
            composable(Routes.FAMILIES) {
                FamiliesScreen(onFamilyClick = { navController.navigate(Routes.familyDetail(it)) })
            }
            composable("family/{familyCode}") { entry ->
                val familyCode = entry.arguments?.getString("familyCode") ?: ""
                FamilyDetailScreen(
                    familyCode = familyCode,
                    onBack = { navController.popBackStack() },
                    onPolicyClick = { navController.navigate(Routes.policyDetail(it)) },
                    onClientClick = { navController.navigate(Routes.clientDetail(it)) },
                    onAddPolicy = { fc -> navController.navigate(Routes.createPolicy(fc, "")) },
                    onAddClient = { navController.navigate(Routes.CLIENTS) }
                )
            }
            composable(Routes.CLIENTS) {
                ClientsScreen(
                    onBack = { navController.popBackStack() },
                    onClientClick = { navController.navigate(Routes.clientDetail(it)) },
                    onAddPolicy = { fc, pc -> navController.navigate(Routes.createPolicy(fc, pc)) }
                )
            }
            composable("client/{id}") { entry ->
                val id = entry.arguments?.getString("id")?.toIntOrNull() ?: 0
                ClientDetailScreen(
                    clientId = id,
                    onBack = { navController.popBackStack() },
                    onPolicyClick = { navController.navigate(Routes.policyDetail(it)) },
                    onAddPolicy = { fc, pc -> navController.navigate(Routes.createPolicy(fc, pc)) }
                )
            }
            composable(Routes.SEARCH) {
                SearchScreen(
                    onBack = { navController.popBackStack() },
                    onFamilyClick = { navController.navigate(Routes.familyDetail(it)) },
                    onClientClick = { navController.navigate(Routes.clientDetail(it)) },
                    onPolicyClick = { navController.navigate(Routes.policyDetail(it)) }
                )
            }
            composable(Routes.COMMISSION) {
                CommissionScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.LOANS) {
                LoansScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.SB) {
                SBScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.LEADS) {
                LeadsScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.ACTIVITIES) {
                ActivitiesScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.GST) {
                GSTScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.REPORTS) {
                ReportsScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.PROFILE) {
                ProfileScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.MORE) {
                MoreScreen(
                    onNavigate = { route ->
                        if (route in bottomTabs.map { it.route }) {
                            navController.navigateToTab(route)
                        } else {
                            navController.navigate(route)
                        }
                    },
                    onLogout = {
                        navController.navigate(Routes.LOGIN) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}
