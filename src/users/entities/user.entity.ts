import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Device } from 'src/device/entities/device.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50 })
    firstName: string;

    @Column({ length: 50 })
    lastName: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ unique: true, length: 30 })
    username: string;

    @Column()
    @Exclude()
    password: string;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
    role: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // relations
    @OneToMany(() => Device, device => device.user)
    devices: Device[];
}