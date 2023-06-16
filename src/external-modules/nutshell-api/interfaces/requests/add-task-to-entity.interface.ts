export interface IAddTaskToEntity {
  task: {
    title: string;
    description?: string;
    entity: {
      entityType: EntityTypeForTask; // This should be more flexible
      id: string;
    };
  };
}

export type EntityTypeForTask = 'Lead';
