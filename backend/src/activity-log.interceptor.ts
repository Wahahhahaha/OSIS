import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers, body } = request;

    // Only intercept POST requests
    if (method === 'POST') {
      return next.handle().pipe(
        tap(async () => {
          try {
            // Get username from request.user (injected by JwtAuthGuard) or check body/headers
            let username = 'Guest';
            if (request.user && request.user.username) {
              username = request.user.username;
            } else if (body && body.username) {
              username = body.username;
            }

            // Get IP Address
            let ipAddress = request.headers['x-forwarded-for'] || request.socket.remoteAddress || '127.0.0.1';
            if (Array.isArray(ipAddress)) {
              ipAddress = ipAddress[0];
            }
            if (ipAddress === '::1') {
              ipAddress = '127.0.0.1';
            }

            // Get Latitude and Longitude from headers (sent by the client)
            const latHeader = request.headers['x-latitude'];
            const lngHeader = request.headers['x-longitude'];
            
            const latitude = latHeader ? parseFloat(latHeader as string) : -6.2088; // Default to Jakarta
            const longitude = lngHeader ? parseFloat(lngHeader as string) : 106.8456;

            // Generate action text (exclude heavy request bodies like files or passwords for security/cleanliness)
            const cleanBody = { ...body };
            delete cleanBody.password;
            delete cleanBody.photo;
            delete cleanBody.fileUrl;

            // Format action nicely
            let actionName = `Melakukan POST ke ${url}`;
            if (url.includes('/auth/login')) {
              actionName = 'Melakukan Login';
            } else if (url.includes('/auth/register')) {
              actionName = 'Melakukan Registrasi User Baru';
            } else if (url.includes('/admin/kas/pay')) {
              actionName = `Mencatat Pembayaran Kas Kelas ID: ${cleanBody.classId}`;
            } else if (url.includes('/admin/prokers') && method === 'POST') {
              actionName = `Membuat Program Kerja Baru: "${cleanBody.name}"`;
            } else if (url.includes('/admin/candidates') && method === 'POST') {
              actionName = `Menambahkan Kandidat OSIS: "${cleanBody.name}"`;
            } else if (url.includes('/admin/votes') && method === 'POST') {
              actionName = `Melakukan Voting untuk Kandidat ID: ${cleanBody.candidateId}`;
            }

            const action = `${actionName} (${url})`;

            await this.prisma.activityLog.create({
              data: {
                username,
                ipAddress: String(ipAddress),
                latitude,
                longitude,
                action,
              },
            });
          } catch (err) {
            console.error('Failed to log activity:', err);
          }
        }),
      );
    }

    return next.handle();
  }
}
