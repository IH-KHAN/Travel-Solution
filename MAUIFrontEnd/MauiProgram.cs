using Microsoft.Extensions.Logging;

namespace MAUIFrontEnd
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                });

            builder.Services.AddMauiBlazorWebView();

            // HttpClient must be Singleton so the same instance is shared across
            // CustomAuthStateProvider and all Blazor components (auth headers propagate correctly)
#if ANDROID
            builder.Services.AddSingleton(sp => new HttpClient { BaseAddress = new Uri("http://10.0.2.2:5246/api/") });
#else
            builder.Services.AddSingleton(sp => new HttpClient { BaseAddress = new Uri("http://localhost:5246/api/") });
#endif

            // Register Custom Authentication State Provider and Core Authorization
            builder.Services.AddAuthorizationCore();
            builder.Services.AddSingleton<Microsoft.AspNetCore.Components.Authorization.AuthenticationStateProvider, MAUIFrontEnd.Services.CustomAuthStateProvider>();
            builder.Services.AddSingleton<MAUIFrontEnd.Services.CustomAuthStateProvider>(sp =>
                (MAUIFrontEnd.Services.CustomAuthStateProvider)sp.GetRequiredService<Microsoft.AspNetCore.Components.Authorization.AuthenticationStateProvider>());

#if DEBUG
    		builder.Services.AddBlazorWebViewDeveloperTools();
    		builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}
