import { ContainerModule } from '@theia/core/shared/inversify';
import { TaskContribution } from '@theia/task/lib/browser/task-contribution';
import { BackendApplicationContribution } from '@theia/core/lib/node/backend-application';
import { RosBuildTaskProvider } from './ros-build-tasks';
import { O1RestContribution } from './o1-rest-contribution';

export default new ContainerModule(bind => {
    // Feature 5: colcon / CMake build tasks
    bind(RosBuildTaskProvider).toSelf().inSingletonScope();
    bind(TaskContribution).toService(RosBuildTaskProvider);

    // Toolchain REST API + optional auth middleware
    bind(O1RestContribution).toSelf().inSingletonScope();
    bind(BackendApplicationContribution).toService(O1RestContribution);
});
