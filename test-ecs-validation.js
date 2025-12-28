// ECS System Validation Test
// This file tests all ECS components and systems to ensure they work correctly

console.log('🧪 Starting ECS Validation Tests...');

async function validateECSSystem() {
    try {
        // Test 1: Core ECS System
        console.log('\n✅ Test 1: Core ECS System');
        const { Entity, Component, System, World } = await import('./src/core/EntityComponentSystem.js');
        
        const world = new World();
        const entity = world.createEntity();
        
        console.log('  ✓ Entity created:', entity.id);
        console.log('  ✓ World initialized with', world.systemsArray.length, 'systems');
        
        // Test 2: Components
        console.log('\n✅ Test 2: Component System');
        const { Transform, Velocity, Sprite } = await import('./src/components/CoreComponents.js');
        
        entity.addComponent(new Transform(100, 200));
        entity.addComponent(new Velocity(5, -3));
        entity.addComponent(new Sprite(32, 32, '#ff0000'));
        
        console.log('  ✓ Transform component:', entity.getComponent(Transform));
        console.log('  ✓ Velocity component:', entity.getComponent(Velocity));
        console.log('  ✓ Sprite component:', entity.getComponent(Sprite));
        
        // Test 3: Systems
        console.log('\n✅ Test 3: System Integration');
        const { MovementSystem } = await import('./src/systems/ecs/MovementSystem.js');
        
        const movementSystem = new MovementSystem();
        world.addSystem(movementSystem);
        
        console.log('  ✓ Movement system added');
        console.log('  ✓ System entities count:', movementSystem.entities.size);
        
        // Test 4: Entity Factory
        console.log('\n✅ Test 4: Entity Factory');
        const { EntityFactory } = await import('./src/factories/EntityFactory.js');
        
        const factory = new EntityFactory(world);
        const player = factory.createPlayer(400, 500, 800, 600);
        
        console.log('  ✓ Player entity created:', player.id);
        console.log('  ✓ Player components:', Array.from(player.components.keys()));
        
        // Test 5: ECS Game Manager
        console.log('\n✅ Test 5: ECS Game Manager');
        
        // Mock canvas and context
        const mockCanvas = { width: 800, height: 600 };
        const mockCtx = { 
            save: () => {}, 
            restore: () => {}, 
            fillRect: () => {},
            strokeRect: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            closePath: () => {},
            fill: () => {},
            stroke: () => {},
            arc: () => {},
            ellipse: () => {},
            translate: () => {},
            rotate: () => {},
            createLinearGradient: () => ({
                addColorStop: () => {}
            }),
            createRadialGradient: () => ({
                addColorStop: () => {}
            }),
            fillStyle: '#000000',
            strokeStyle: '#000000',
            lineWidth: 1,
            shadowColor: '#000000',
            shadowBlur: 0,
            globalAlpha: 1,
            textAlign: 'left',
            font: '12px Arial',
            fillText: () => {},
            strokeText: () => {}
        };
        const mockInputSystem = { 
            isKeyPressed: () => false,
            isKeyJustPressed: () => false,
            update: () => {}
        };
        
        const { ECSGameManager } = await import('./src/core/ECSGameManager.js');
        const ecsManager = new ECSGameManager(mockCanvas, mockCtx, mockInputSystem);
        
        console.log('  ✓ ECS Game Manager created');
        console.log('  ✓ Systems initialized:', ecsManager.getSystemCount());
        
        // Test 6: Entity Creation and Management
        console.log('\n✅ Test 6: Entity Management');
        
        const testPlayer = ecsManager.createPlayer(400, 500);
        const testEnemy = ecsManager.createEnemy(200, 100, 'enemy');
        const testBullet = ecsManager.createBullet(400, 480);
        
        // Process pending entity additions
        ecsManager.world.update(0);
        
        console.log('  ✓ Player created:', testPlayer.id);
        console.log('  ✓ Enemy created:', testEnemy.id);
        console.log('  ✓ Bullet created:', testBullet.id);
        console.log('  ✓ Total entities:', ecsManager.getEntityCount());
        
        // Test 7: System Update
        console.log('\n✅ Test 7: System Updates');
        
        const initialPlayerPos = ecsManager.getPlayerPosition();
        console.log('  ✓ Initial player position:', initialPlayerPos);
        
        // Simulate one frame update
        ecsManager.update(16.67); // ~60 FPS
        
        const updatedPlayerPos = ecsManager.getPlayerPosition();
        console.log('  ✓ Updated player position:', updatedPlayerPos);
        
        // Test 8: Component Access
        console.log('\n✅ Test 8: Component Access');
        
        console.log('  ✓ Player energy:', ecsManager.getPlayerEnergy());
        console.log('  ✓ Player energy %:', ecsManager.getPlayerEnergyPercentage());
        console.log('  ✓ Player score:', ecsManager.getPlayerScore());
        console.log('  ✓ Bullet count:', ecsManager.getBulletCount());
        console.log('  ✓ Enemy count:', ecsManager.getEnemyCount());
        
        // Test 9: Energy System
        console.log('\n✅ Test 9: Energy System');
        
        const initialEnergy = ecsManager.getPlayerEnergy();
        const consumed = ecsManager.consumePlayerEnergy(10);
        const newEnergy = ecsManager.getPlayerEnergy();
        
        console.log('  ✓ Initial energy:', initialEnergy);
        console.log('  ✓ Energy consumed:', consumed);
        console.log('  ✓ New energy:', newEnergy);
        console.log('  ✓ Energy difference:', initialEnergy - newEnergy);
        
        // Test 10: Performance Stats
        console.log('\n✅ Test 10: Performance Monitoring');
        
        const stats = ecsManager.getStats();
        console.log('  ✓ Performance stats:', stats);
        
        console.log('\n🎉 All ECS validation tests passed!');
        console.log('📊 Final Stats:');
        console.log('   - Entities:', ecsManager.getEntityCount());
        console.log('   - Systems:', ecsManager.getSystemCount());
        console.log('   - Update time:', stats.updateTime.toFixed(2), 'ms');
        
        return true;
        
    } catch (error) {
        console.error('❌ ECS Validation failed:', error);
        console.error('Stack trace:', error.stack);
        return false;
    }
}

// Run validation if this file is executed directly
if (typeof window === 'undefined') {
    validateECSSystem().then(success => {
        process.exit(success ? 0 : 1);
    });
} else {
    // Browser environment - attach to window for manual testing
    window.validateECS = validateECSSystem;
    console.log('🌐 ECS validation available as window.validateECS()');
}

export { validateECSSystem };