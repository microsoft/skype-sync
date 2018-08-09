using System;
using System.Linq;
using System.Security.Claims;

namespace Microsoft.Skype.Interviews.Samples.DevHub.Extensions
{
    public static class ClaimsExtensions
    {
        public static string GetSessionId(this ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal
                .Claims.Single(p => p.Type.Equals("sessionId", StringComparison.InvariantCultureIgnoreCase))
                .Value;
        }

        public static string GetAddinSessionId(this ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal
                .Claims.Single(p => p.Type.Equals("addinSessionId", StringComparison.InvariantCultureIgnoreCase))
                .Value;
        }

        public static string GetAddinUserId(this ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal
                .Claims.Single(p => p.Type.Equals("addinUserId", StringComparison.InvariantCultureIgnoreCase))
                .Value;
        }

        public static string GetAddinUserType(this ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal
                .Claims.Single(p => p.Type.Equals("addinUserType", StringComparison.InvariantCultureIgnoreCase))
                .Value;
        }

        public static string GetAddinIdentifier(this ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal
                .Claims.Single(p => p.Type.Equals("addinIdentifier", StringComparison.InvariantCultureIgnoreCase))
                .Value;
        }
    }
}