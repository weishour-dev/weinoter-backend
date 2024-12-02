import { BaseEntity, Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity()
export class CasbinMongoRule extends BaseEntity {
  @ObjectIdColumn()
  public id!: ObjectId;

  @Column({
    nullable: true,
  })
  public ptype!: string;

  @Column({
    nullable: true,
  })
  public v0!: string;

  @Column({
    nullable: true,
  })
  public v1!: string;

  @Column({
    nullable: true,
  })
  public v2!: string;

  @Column({
    nullable: true,
  })
  public v3!: string;

  @Column({
    nullable: true,
  })
  public v4!: string;

  @Column({
    nullable: true,
  })
  public v5!: string;

  @Column({
    nullable: true,
  })
  public v6!: string;
}
