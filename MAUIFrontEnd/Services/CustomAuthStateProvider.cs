using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.Maui.Storage;

namespace MAUIFrontEnd.Services
{
    public class CustomAuthStateProvider : AuthenticationStateProvider
    {
        private readonly HttpClient _httpClient;
        private const string TokenKey = "authToken";
        private const string RoleKey = "userRole";
        private const string NameKey = "userName";

        public CustomAuthStateProvider(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public override async Task<AuthenticationState> GetAuthenticationStateAsync()
        {
            var token = Preferences.Get(TokenKey, string.Empty);

            if (string.IsNullOrWhiteSpace(token))
            {
                CleanUpClientHeader();
                return new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()));
            }

            try
            {
                var claims = ParseClaimsFromJwt(token);
                var identity = new ClaimsIdentity(claims, "jwt");
                var user = new ClaimsPrincipal(identity);

                // Configure Client Header
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                return new AuthenticationState(user);
            }
            catch
            {
                CleanUpClientHeader();
                return new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()));
            }
        }

        public void NotifyLogin(string token, string role, string name)
        {
            Preferences.Set(TokenKey, token);
            Preferences.Set(RoleKey, role);
            Preferences.Set(NameKey, name);

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var claims = ParseClaimsFromJwt(token);
            var identity = new ClaimsIdentity(claims, "jwt");
            var user = new ClaimsPrincipal(identity);

            NotifyAuthenticationStateChanged(Task.FromResult(new AuthenticationState(user)));
        }

        public void NotifyLogout()
        {
            Preferences.Remove(TokenKey);
            Preferences.Remove(RoleKey);
            Preferences.Remove(NameKey);

            CleanUpClientHeader();

            var anonymous = new ClaimsPrincipal(new ClaimsIdentity());
            NotifyAuthenticationStateChanged(Task.FromResult(new AuthenticationState(anonymous)));
        }

        private void CleanUpClientHeader()
        {
            _httpClient.DefaultRequestHeaders.Authorization = null;
        }

        private IEnumerable<Claim> ParseClaimsFromJwt(string jwt)
        {
            var claims = new List<Claim>();
            
            // Check if JWT format is valid
            var parts = jwt.Split('.');
            if (parts.Length < 2)
            {
                return claims;
            }

            var payload = parts[1];
            var jsonBytes = ParseBase64WithoutPadding(payload);
            var keyValuePairs = JsonSerializer.Deserialize<Dictionary<string, object>>(jsonBytes);

            if (keyValuePairs != null)
            {
                foreach (var kvp in keyValuePairs)
                {
                    var valueStr = kvp.Value?.ToString() ?? string.Empty;
                    
                    // Decode role claims
                    if (kvp.Key == ClaimTypes.Role || kvp.Key == "role" || kvp.Key == "roles" || kvp.Key == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")
                    {
                        if (kvp.Value is JsonElement element && element.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var role in element.EnumerateArray())
                            {
                                claims.Add(new Claim(ClaimTypes.Role, role.GetString() ?? string.Empty));
                            }
                        }
                        else
                        {
                            claims.Add(new Claim(ClaimTypes.Role, valueStr));
                        }
                    }
                    // Decode name claims
                    else if (kvp.Key == ClaimTypes.Name || kvp.Key == "unique_name" || kvp.Key == "name" || kvp.Key == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name")
                    {
                        claims.Add(new Claim(ClaimTypes.Name, valueStr));
                    }
                    // Decode email claims
                    else if (kvp.Key == ClaimTypes.Email || kvp.Key == "email" || kvp.Key == "sub" || kvp.Key == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")
                    {
                        claims.Add(new Claim(ClaimTypes.Email, valueStr));
                    }
                    else
                    {
                        claims.Add(new Claim(kvp.Key, valueStr));
                    }
                }
            }

            return claims;
        }

        private byte[] ParseBase64WithoutPadding(string base64)
        {
            switch (base64.Length % 4)
            {
                case 2: base64 += "=="; break;
                case 3: base64 += "="; break;
            }
            return Convert.FromBase64String(base64.Replace('-', '+').Replace('_', '/'));
        }
    }
}
