from api.environment import *

def train(width, height, cargo_pickups, cargo_dropoffs):
    # Initialize reinforcement learning environment
    environment = TruckWorld(width, height, cargo_pickups, cargo_dropoffs)

    # Learning rate (how fast you update Q matrix)
    alpha = 0.1

    # Value of future rewards (1 means future rewards are as valuable as current rewards)
    gamma = 0.1

    #Exploration value (0 means always pick the greedy action)
    epsilon = 1

    # Initialize Q learning matrix
    Q = np.zeros((len(environment.state_space), len(environment.possible_actions)))
    
    # Cap the number of games to train model
    max_games = 50000

    # Cap the length of each game at 99 moves
    maxSteps = 99

    # Estimated number of games it will take (to estimate epsilon decay)
    num_games = width * height * len(cargo_pickups) * 100

    # Set rate of epsilon decay (exploration rate decreases over time)
    # This should be smaller with a larger number of games
    epsilon_decay = 0.9 / (num_games * 2)

    # Initialize variables for training
    total_rewards = []
    streak = 0
    i = 0
    
    while i < max_games:
        # This handy print line just shows us if our algorithm is training properly
        if i % 1000 == 0:
            print("Starting Game ", i)
        
        # Reset all necessary variables before each new game
        done = False
        ep_rewards = 0
        observation = environment.state_space.index(environment.reset())
        
        # Run a maximum of 99 actions per individual game
        for step in range(maxSteps):
            rand = random.uniform(0,1)

            # Here we enable the exploration rate for exploring new states to 
            # determine whether the agent takes a random action or takes the best
            # action based on the Q Matrix.
            if rand > epsilon:
                action = np.argmax(Q[observation, :])
            else:
                action = environment.action_space_sample()

            # Here we get the best possible action that the truck can take and we
            # get the state of the environment after the truck takes the action.
            new_observation, reward, done = environment.step(action)
            observation_ = environment.state_space.index(new_observation)
            action_ = np.argmax(Q[observation, :])

            # Here we use a famous reinforcement learning equation used in QLearning
            # called Bellman's Equation to optimize the values in our Q table.
            Q[observation, action] = Q[observation, action] + alpha * (reward + gamma * np.max(Q[observation_, :]) - Q[observation, action])
            
            observation = observation_
            ep_rewards += reward
            
            if done:
                break
        
        # Here we slowly decrement our exploration rate so that the agent explores
        # less often over time and takes the best action more often.
        if epsilon > 0.1:
            epsilon -= epsilon_decay
            
        # Update the streak (we want a streak of positive reward games)
        if ep_rewards > 0:
            streak += 1
        else:
            streak = 0
        
        # If the model can get 20 in a row its good to go
        if streak > width * height * 2:
            print(f"Took: {i}")
            break
        
        # Complete iteration
        total_rewards.append(ep_rewards)
        i += 1
    
    print(total_rewards[-40:-1]) 

    #Save Q to database here