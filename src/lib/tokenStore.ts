import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'balam_token';
const AGENT_KEY = 'balam_agent';

let _token: string | null = null;

export function getToken() {
  return _token;
}

export function setMemoryToken(t: string | null) {
  _token = t;
}

export async function loadStoredAuth() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const agentRaw = await SecureStore.getItemAsync(AGENT_KEY);
  _token = token;
  return {
    token,
    agent: agentRaw ? JSON.parse(agentRaw) : null,
  };
}

export async function persistAuth(token: string, agent: object) {
  _token = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(AGENT_KEY, JSON.stringify(agent));
}

export async function clearAuth() {
  _token = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(AGENT_KEY);
}
