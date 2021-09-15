# System Requirements

Certain HASH features rely on cutting-edge technology that may not be supported in every browser and on every platform. For whatever browser you choose to use, we recommend the latest and greatest version to ensure support. We have found the best performance and user experience on the latest Chrome release.

## hCore

### Browser Compatibility

{% hint style="info" %}
**JavaScript** and **Python** behaviors can be authored via the in-browser IDE at this time. Support for Rust behavior authoring in hCore is [coming soon](https://hash.ai/roadmap) - at present only hIndex-listed Rust behaviors are available for import within simulations.
{% endhint %}

| Environment execution ability | Chrome | Firefox | Safari |
| :--- | :--- | :--- | :--- |
| Local JS Behaviors | ✔ | ✔ | ✔ |
| Local Python Behaviors | ✔ | ✔ | 𝙓 |
| Local Rust Behaviors | ✔ | ✔ | ✔ |
| Cloud JS Behaviors | ✔ | ✔ | ✔ |
| Cloud Python Behaviors | ✔ | ✔ | ✔ |
| Cloud Rust Behaviors | ✔ | ✔ | ✔ |

{% hint style="success" %}
**Simulations can be run on** [**HASH Cloud**](../creating-simulations/h.cloud.md) **with results streamed back to any browser.** For example, Safari users running Python simulations can execute Python simulations in hCloud.
{% endhint %}

### Hardware Requirements

We recommend ensuring your device has at least 8GB of ram and a decent graphics card to create, run and explore most normal-sized simulations. If you stumble into performance issues, try using the "Run in Cloud" button in hCore to offload the heavy-lifting and computation to [hCloud](../creating-simulations/h.cloud.md).

Local simulations run in hCore typically scale easily to ~2,000 agents, but if your simulation is much larger than that, or the number of agents grows exponentially, executing on HASH Cloud may be a better fit.

### Mobile Support

While hCore will run on Safari and Chrome mobile browsers, it is not officially supported.

