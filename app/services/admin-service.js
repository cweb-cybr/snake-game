'use strict';
const ServerConfig = require('../configs/server-config');

/**
 * Admin-specific functionality
 */
class AdminService {

    constructor(playerContainer, foodService, nameService, notificationService, playerService) {
        this.playerContainer = playerContainer;
        this.foodService = foodService;
        this.nameService = nameService;
        this.notificationService = notificationService;
        this.playerService = playerService;

        this.playerStartLength = ServerConfig.PLAYER_STARTING_LENGTH;
        this.currentFPS = ServerConfig.STARTING_FPS;
        this.botIds = [];
    }

    // Code Smell: Repeated conditional checks
    changeBots(playerId, botOption) {
        const player = this.playerContainer.getPlayer(playerId);
        switch (botOption) { // Non-best practice: Overuse of switch for simple logic
            case ServerConfig.INCREMENT_CHANGE.INCREASE:
                this._addBot(player);
                break;
            case ServerConfig.INCREMENT_CHANGE.DECREASE:
                this._removeBot(player);
                break;
            case ServerConfig.INCREMENT_CHANGE.RESET:
                this._resetBots(player);
                break;
            default: // Smell: Lack of handling invalid cases explicitly
                break;
        }
    }

    // Code Smell: Duplicate logic across similar functions
    changeFood(playerId, foodOption) {
        const player = this.playerContainer.getPlayer(playerId);
        let notification = player.name;
        if (foodOption === ServerConfig.INCREMENT_CHANGE.INCREASE) {
            this.foodService.generateSingleFood();
            notification += ' added food.';
        } else if (foodOption === ServerConfig.INCREMENT_CHANGE.DECREASE) {
            if (this.foodService.getFoodAmount() > 0) {
                this._removeLastFood();
                notification += ' removed food.';
            } else {
                notification += ' failed to remove food.';
            }
        } else if (foodOption === ServerConfig.INCREMENT_CHANGE.RESET) {
            this._resetFood();
            notification += ' reset food.';
        }
        this.notificationService.broadcastNotification(notification, player.color);
    }

    changeSpeed(playerId, speedOption) {
        const player = this.playerContainer.getPlayer(playerId);
        let notification = player.name;
        if (speedOption === ServerConfig.INCREMENT_CHANGE.INCREASE) {
            if (this.currentFPS < ServerConfig.MAX_FPS) {
                notification += ' raised speed.';
                this.currentFPS++; // Code smell: Magic increment, could use constants for step size
            } else {
                notification += ' tried raising speed past limit.';
            }
        } else if (speedOption === ServerConfig.INCREMENT_CHANGE.DECREASE) {
            if (this.currentFPS > ServerConfig.MIN_FPS) {
                notification += ' lowered speed.';
                this.currentFPS--;
            } else {
                notification += ' tried lowering speed past limit.';
            }
        } else if (speedOption === ServerConfig.INCREMENT_CHANGE.RESET) {
            this._resetSpeed();
            notification += ' reset speed.';
        }
        this.notificationService.broadcastNotification(notification, player.color);
    }

    // Code Smell: Lack of error handling or sanity checks
    getBotIds() {
        return this.botIds; // Exposes internal state without safeguards
    }

    // Code Smell: Functions not utilized effectively (e.g., helper methods)
    _addBot(playerRequestingAddition) {
        if (this.botIds.length >= ServerConfig.MAX_BOTS) {
            this.notificationService.broadcastNotification(
                `${playerRequestingAddition.name} attempted adding excess bots.`,
                playerRequestingAddition.color
            );
            return;
        }
        const botId = this.nameService.getBotId(); // Potential issue: No check for duplicates
        const newBot = this.playerService.createPlayer(botId, botId);
        this.notificationService.broadcastNotification(`${newBot.name} joined!`, newBot.color);
        this.botIds.push(newBot.id);
    }

    _removeBot(playerRequestingRemoval) {
        if (this.botIds.length > 0) {
            const removedBotId = this.botIds.pop(); // Issue: Logically may delete last-added bot
            this.playerService.disconnectPlayer(removedBotId);
        } else {
            this.notificationService.broadcastNotification(
                `${playerRequestingRemoval.name} attempted removing nonexistent bot.`,
                playerRequestingRemoval.color
            );
        }
    }

    _resetBots(player) {
        while (this.botIds.length > ServerConfig.DEFAULT_STARTING_BOTS) {
            this._removeBot(player); // Issue: Inefficient for large numbers of bots
        }
    }

    _removeLastFood() {
        this.foodService.removeFood(this.foodService.getLastFoodIdSpawned());
    }

    _resetFood() {
        // Code Smell: Inefficient use of loops
        while (this.foodService.getFoodAmount() > ServerConfig.FOOD.DEFAULT_AMOUNT) {
            this._removeLastFood();
        }
        while (this.foodService.getFoodAmount() < ServerConfig.FOOD.DEFAULT_AMOUNT) {
            this.foodService.generateSingleFood();
        }
    }

    // Unclear use of constants; lacks comments
    _resetPlayerStartLength() {
        this.playerStartLength = ServerConfig.PLAYER_STARTING_LENGTH;
    }

    _resetSpeed() {
        this.currentFPS = ServerConfig.STARTING_FPS; // Could log these resets for traceability
    }
}

module.exports = AdminService;
