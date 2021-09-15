# Query Customers

Businesses will perform two actions in this model: query customers and collect customer responses to update their position and item price.

{% hint style="info" %}
Query customers → Businesses will send their neighbors every possible position and item\_price change combination.

* Position changes: `[ [-1, 0], [0, 0], [1, 0], [0, -1], [0, 1] ]`
* Item\_price changes: `item_price + 1, item_price, item_price - 1`

Collect customer responses → Businesses will collect and store all the customer responses to determine the position and item\_price combination with the largest profit
{% endhint %}

This action can be split into three separate functions within business.js: _send\_message_, _price\_messaging_, _movement\_messaging_.

Let’s start with sending the message. **`send_message()`** will add messages to state.messages with a neighbor agent\_id, position, item\_price, and rgb. Add this function to business.js.

{% tabs %}
{% tab title="business.js" %}
```javascript
const send_message = (agent_id, position, price) => {
  state.addMessage(agent_id, "business_movement", {
    position,
    price,
    rgb: state.rgb
  });
}
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
`rgb` is sent so we can visually see which business a customer chooses to shop at
{% endhint %}

The next step is to create the **`price_messaging()`** function. This function will receive the neighbor's agent\_id and position change, iterate through the possible item\_price values, and call send\_message to notify all possible neighbors.

```javascript
const price_messaging = (agent_id, position) => {
  const item_price = state.item_price;

  send_message(agent_id, position, item_price);
  send_message(agent_id, position, item_price + 1);

  if (item_price > 1) {
    send_message(agent_id, position, item_price - 1);
  }
}
```

Notice here how we check if the `item_price` is greater than 1. This is important as we don’t want the `item_price` to drop below 0.

The final function we are going to create for querying Customers is movement messaging; however, since this will be our top level function we are going to name it **`query_customers()`**. In this function, business agents are going to iterate through their Customer neighbors and send them all possible position and item\_price change combinations.

```javascript
const query_customers = (neighbors, state_position) => {
  const possible_movement = [[-1, 0], [0, 0], [1, 0], [0, -1], [0, 1]];

  neighbors.filter((n) => n.behaviors.includes("customer.js")).forEach((n) => {
    possible_movement.forEach((movement) => {
      const new_position = [state_position[0] + movement[0], state_position[1] + movement[1], 0];
      price_messaging(n.agent_id, new_position);
    })
  })
}
```

You can test your new code by placing the following snippet underneath your function declarations and looking at the Raw Output view tab.

```text
query_customers(context.neighbors(), state.position);
```

Find the messages field for a Business agent and it should be filled with “business\_movement” type messages.

{% hint style="danger" %}
Since Business agents are sending around 100 \(neighbors\) x 6 \(positions\) x 3 \(prices\) messages at one time, we don’t want this to occur every time step. We'll add a counter to ensure it happens at the rate we want.

1. Add the HASH shared behavior **Counter** \(shortname: @hash/counter/counter.rs\) to your simulation and add the counter behavior to your business agents BEFORE your behavior **`business.js`**. \(You want the counter to increment before **`business.js`** is called\)
2. In **`init.json`** give your Business agents three more variables:
3. counter: 0
4. counter\_reset\_at: 2
5. counter\_reset\_to: 0

   **\*\*3. In the** `business.js`\*\* behavior, wrap the `query_customers()` call in the following if statement:
{% endhint %}

```javascript
if (state.counter === 0) {
  query_customers(context.neighbors(), state.position);
}
```

{% hint style="danger" %}
The behavior **Counter** adds a counter variable to every business agent that will automatically increment at each time step. This ensures that query\_customers\(\) is only called every 3 time steps.
{% endhint %}

{% tabs %}
{% tab title="business.js" %}
```javascript
const behavior = (state, context) => {
 const send_message = (agent_id, position, price) => {
   state.addMessage(agent_id, "business_movement", {
     position,
     price,
     rgb: state.rgb
   });
 }

 const price_messaging = (agent_id, position) => {
   const item_price = state.item_price;
   send_message(agent_id, position, item_price);
   send_message(agent_id, position, item_price + 1);
   if (item_price > 1) {
     send_message(agent_id, position, item_price - 1);
   }
 }

 const query_customers = (neighbors, state_position) => {
   const possible_movement = [[-1, 0], [0, 0], [1, 0], [0, -1], [0, 1]];
   neighbors.filter((n) => n.behaviors.includes("customer.js"))
     .forEach((n) => {
       possible_movement.forEach((movement) => {
         const new_position = [state_position[0] + movement[0], state_position[1] + movement[1]];
         price_messaging(n.agent_id, new_position);
       })
     })
 }

 if (state.counter === 0) {
     query_customers(context.neighbors(), state.position);
 }
}
```
{% endtab %}
{% endtabs %}

