using System;

namespace Microsoft.Skype.Interviews.Samples.DevHub.Extensions
{
    public static class DateTimeUtils
    {
        private static readonly long DatetimeMinTimeTicks = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).Ticks;

        public static long ConvertToJsFormat(this DateTime time)
        {
            return ((time.ToUniversalTime().Ticks - DatetimeMinTimeTicks) / 10000);
        }
    }
}
