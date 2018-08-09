using MessagePack;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Microsoft.Skype.Interviews.Samples.DevHub.hubs
{
    public interface IAddinsHub
    {
        /// <summary>
        /// Sends the addin message.
        /// </summary>
        /// <param name="message">The message.</param>
        Task MessageReceived(AddinMessageRequest message);
    }

    [MessagePackObject]
    public class AddinMessageRequest
    {
        [JsonProperty("data")]
        [Key("data")]
        public List<AddinMessage> Data { get; set; }

        [JsonProperty("serverTimeStamp")]
        [Key("serverTimeStamp")]
        public long ServerTimeStamp { get; set; }
    }

    [MessagePackObject]
    public class AddinMessage
    {
        [JsonProperty("type")]
        [Key("type")]
        public string Type { get; set; }

        [JsonProperty("payload")]
        [Key("payload")]
        public string Payload { get; set; }

        [JsonProperty("time")]
        [Key("time")]
        public long Time { get; set; }
    }
}