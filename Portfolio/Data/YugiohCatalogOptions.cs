using System;

namespace Portfolio.Data
{
    public sealed class YugiohCatalogOptions
    {
        public string CardEndpoint { get; set; } = "https://db.ygoprodeck.com/api/v7/cardinfo.php?misc=yes";

        public int CacheDurationMinutes { get; set; } = 360;

        public int RequestTimeoutSeconds { get; set; } = 90;

        public TimeSpan CacheDuration => TimeSpan.FromMinutes(CacheDurationMinutes);

        public TimeSpan RequestTimeout => TimeSpan.FromSeconds(RequestTimeoutSeconds);
    }
}
