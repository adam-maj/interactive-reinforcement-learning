# Import all of the necessary libraries
import numpy as np
import random

class TruckWorld(object):
    
    """
    My truck game environment consists of a grid of tiles. The grid can be any 
    dimension specified by the user. A truck randomly spawns in one of these 
    tiles and cargo for the truck spawns in another tile. Meanwhile, the target
    dropoff point for the cargo spawns on yet another tile. The goal of the game 
    is for the truck to:
    1. Navigate from its starting tile to the tile with the cargo
    2. Pickup the cargo
    3. Navigate from here to the cargo dropoff point
    4. Dropoff the cargo

    Action Space (All the possible actions the truck can take):
    [0]: Up
    [1]: Down
    [2]: Left
    [3]: Right
    [4]: Pickup Cargo
    [5]: Dropoff Cargo
    """
    
    def __init__(self, m, n, cargo_pickups, cargo_dropoffs):
        """
        Here we initialize the truck class. The m and n variables are the 
        dimensions of the grid. cargo_pickups is a list of the locations
        of possible cargo pickup points, and cargo_dropoffs is a list of
        the possible locations for the cargo dropoff points. Note that in each
        individual instance of the game, cargo only spawns at one of these 
        pickup points and must be delivered to one of these dropoff points
        in specific.
        """
        self.m = m
        self.n = n
        self.cargo_pickups = cargo_pickups
        self.cargo_dropoffs = cargo_dropoffs
        self.cargo_location, self.cargo_destination = self.get_cargo_location()
        self.agent_position = self.get_agent_position()
        
        
        # Here we create the state space for the game, or the set of ALL POSSIBLE
        # states that the game can be in. We find this state space by figuring out
        # the number of possible locations the car, cargo, and cargo destination
        # can be in. 
        self.state_space = []
        for m in range(self.m):
            for n in range(self.n):
                for l in range(len(cargo_pickups) + 1):
                    for d in range(len(cargo_dropoffs)):
                        state = m
                        state *= self.m
                        state += n
                        state *= self.n
                        state += l
                        state *= len(self.cargo_pickups) + 1
                        state += d
                        self.state_space.append(state)
        
        # Here are the values associated with all of the actions that the truck 
        # can take. The corresponding actions are listed in the first comment
        # in this code block. 
        self.possible_actions = [0, 1, 2, 3, 4, 5]
        self.movement_space = {0: -self.n, 1: self.n, 2: -1, 3: 1}
        
        self.update_grid()
    
    def get_coordinates(self, location):
        """
        This function is used to translate from the coordinate system used 
        within the class to a set of coordinates that represent the index of the
        row and column that a location is in the grid. 
        """
        return location // self.m, location % self.n
        
    def get_cargo_location(self):
        """
        This function places the cargo location and cargo destination randomly
        based on the set of possible cargo locations and cargo destinations. 
        This occurs at the begining of any new game.
        """
        return np.random.choice(len(self.cargo_pickups)), np.random.choice(len(self.cargo_dropoffs))
    
    def get_agent_position(self):
        """
        This function places the truck in a random location. It is used at the
        start of a new game to randomly place the truck somewhere.
        """
        return np.random.choice(self.m * self.n)
    
    def update_grid(self):
        """
        This function updates a visual grid representation of the map after 
        every action the truck takes. Ordinary grid locations are represented
        with an 'O', the truck is represented with a 'T', the cargo is 
        represented with a 'C', and the cargo desination is represented 
        with a 'D'.
        """
        self.grid = [['O' for i in range(self.n)] for i in range(self.m)]
        
        agent_m, agent_n = self.get_coordinates(self.agent_position)
        self.grid[agent_m][agent_n] = 'T'
        
        if not self.cargo_location == len(self.cargo_pickups):
            cargo_m, cargo_n = self.get_coordinates(self.cargo_pickups[self.cargo_location])
            self.grid[cargo_m][cargo_n] = 'C'
        
        dest_m, dest_n = self.get_coordinates(self.cargo_dropoffs[self.cargo_destination])
        self.grid[dest_m][dest_n] = 'D'

    def encode_state(self):
        """
        This function enables us to assign a unique number to each state of the
        game from which every aspect of the game can be deduced from. These
        aspects include the location of the truck, the location of the cargo,
        and the destination of the cargo.
        """
        m, n = self.get_coordinates(self.agent_position)
        state = m
        state *= self.m
        state += n
        state *= self.n
        state += self.cargo_location
        state *= len(self.cargo_pickups) + 1
        state += self.cargo_destination
        
        return state
    
    def decode_state(self, state):
        """
        This function allows us to deduce every essential aspect of the game 
        state based on a number. The function deduces the location of the agent,
        the location of the cargo, and the destination of the cargo.
        """
        out = []
        out.append(state % (len(self.cargo_pickups) + 1))
        state // (len(self.cargo_pickups) + 1)
        out.append(state % self.n)
        state // self.n
        out.append(state % self.m)
        state // self.m
        out.append(state)
        
        return reversed(out)
    
    def off_grid_move(self, action):
        """
        This function determines if the agent is trying to move off the grid. 
        For example, if the agent is at the top of the grid and attempts to 
        move up, the function will recognize that this is an off grid move. The
        same goes for the other three edges of the grid.
        """
        agent_m, agent_n = self.get_coordinates(self.agent_position)
        if action == 0 and agent_m == 0:
            return True
        if action == 1 and agent_m == self.m - 1:
            return True
        if action == 2 and agent_n == 0:
            return True
        if action == 3 and agent_n == self.n - 1:
            return True
        return False
        
    def step(self, action):
        """
        This is the most essential function of the environment where the actual
        actions and rewards take place.
        
        In this function, the agent takes an action, the environment is altered
        based on this action, and the player is given a reward for their action.
        """
        agent_m, agent_n = self.get_coordinates(self.agent_position)
        dest_m, dest_n = self.get_coordinates(self.cargo_dropoffs[self.cargo_destination])
        
        # The reward for most actions is -1. This includes moving. Since the 
        # agent gets a negative reward for even moving, it will be incentivized
        # to complete the game in the shortest possible number of moves.
        reward = -1
        done = False
        
        if action in self.movement_space.keys():
            # These are movement actions
            if not self.off_grid_move(action):
                self.agent_position += self.movement_space[action]
                self.update_grid()
        elif action == 4:
            # This is the pickup cargo action
            if not self.cargo_location == len(self.cargo_pickups):
                cargo_m, cargo_n = self.get_coordinates(self.cargo_pickups[self.cargo_location])
                if cargo_m == agent_m and cargo_n == cargo_n:
                    self.cargo_location = len(self.cargo_pickups)
                    self.update_grid()
        elif action == 5:
            # This is the dropoff cargo action
            if self.cargo_location == len(self.cargo_pickups):
                if dest_m == agent_m and dest_n == agent_n:
                    # If the truck successfully drops of cargo at the correct 
                    # location, it is given a reward of 20 to incentivize this.
                    reward = 20
                    done = True
                else:
                    # If the truck drops off the cargo at the wrong location, it
                    # is given a reward of -10 to disincentivize this behavior.
                    reward = -10
        
        return self.encode_state(), reward, done
            
    def reset(self):        
        """
        This function creates a new game
        """
        self.cargo_location, self.cargo_destination = self.get_cargo_location()
        self.agent_position = self.get_agent_position()
        self.update_grid()

        return self.encode_state()
        
    def action_space_sample(self):
        """
        This function selects a random action for the truck to take from the set
        of all possible actions.
        """
        return np.random.choice(self.possible_actions)