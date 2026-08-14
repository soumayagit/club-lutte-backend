import 'dart:convert';
import 'package:get/get.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../clubs/controllers/clubs_controller.dart';
import '../models/adherent_model.dart';

class AdherentsController extends GetxController {
  final adherents = <AdherentModel>[].obs;
  final isLoading = false.obs;
  final isSaving = false.obs;
  final errorMessage = ''.obs;
  final searchQuery = ''.obs;
  final selectedCategory = 'Toutes'.obs;
  final statusFilter = 'PENDING'.obs; // 'PENDING' | 'ALL' | 'VALIDATED'

  // ── Récupère le club actuellement sélectionné (obligatoire pour tout ici) ──
  String? get _clubId {
    if (Get.isRegistered<ClubsController>()) {
      return Get.find<ClubsController>().selectedClub.value?.id;
    }
    return null;
  }

  @override
  void onInit() {
    super.onInit();
    // Un simple Adhérent ne voit que sa propre fiche — inutile de lui imposer
    // le filtre "En attente" par défaut (invisible pour lui, ça cacherait sa fiche
    // si elle est déjà validée). Le staff garde "En attente" en priorité.
    final isStaff = Get.isRegistered<ClubsController>() &&
        (Get.find<ClubsController>().selectedClub.value?.isStaff ?? false);
    statusFilter.value = isStaff ? 'PENDING' : 'ALL';
    fetchAdherents();
  }

  Future<void> fetchAdherents() async {
    final clubId = _clubId;
    if (clubId == null) {
      errorMessage.value = 'Aucun club sélectionné';
      adherents.value = [];
      return;
    }

    isLoading.value = true;
    errorMessage.value = '';
    try {
      final response = await ApiClient.get(ApiConstants.adherentsByClub(clubId));
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        adherents.value = data.map((e) => AdherentModel.fromJson(e)).toList();
      } else {
        errorMessage.value = 'Impossible de charger les adhérents';
        adherents.value = []; // jamais afficher d'anciennes données à côté d'une erreur
      }
    } catch (e) {
      errorMessage.value = 'Erreur de connexion au serveur';
      adherents.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  Future<String?> createDraft(Map<String, dynamic> data) async {
    final clubId = _clubId;
    if (clubId == null) {
      errorMessage.value = 'Aucun club sélectionné';
      return null;
    }

    isSaving.value = true;
    errorMessage.value = '';
    try {
      final response = await ApiClient.post(ApiConstants.adherentsDraftByClub(clubId), data);
      if (response.statusCode == 201) {
        final body = jsonDecode(response.body);
        return body['id'] as String;
      }
      final body = jsonDecode(response.body);
      errorMessage.value = body['message']?.toString() ?? 'Impossible de sauvegarder';
      return null;
    } catch (e) {
      errorMessage.value = 'Erreur de connexion au serveur';
      return null;
    } finally {
      isSaving.value = false;
    }
  }

  Future<bool> saveDraft(String id, Map<String, dynamic> data) async {
    final clubId = _clubId;
    if (clubId == null) {
      errorMessage.value = 'Aucun club sélectionné';
      return false;
    }

    isSaving.value = true;
    errorMessage.value = '';
    try {
      final response = await ApiClient.patch(ApiConstants.adherentDraftById(clubId, id), data);
      if (response.statusCode == 200) {
        return true;
      }
      final body = jsonDecode(response.body);
      errorMessage.value = body['message']?.toString() ?? 'Impossible de sauvegarder';
      return false;
    } catch (e) {
      errorMessage.value = 'Erreur de connexion au serveur';
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  Future<bool> createFinal(Map<String, dynamic> data) async {
    final clubId = _clubId;
    if (clubId == null) {
      errorMessage.value = 'Aucun club sélectionné';
      return false;
    }

    isSaving.value = true;
    errorMessage.value = '';
    try {
      final response = await ApiClient.post(ApiConstants.adherentsByClub(clubId), data);
      if (response.statusCode == 201) {
        await fetchAdherents();
        return true;
      }
      final body = jsonDecode(response.body);
      errorMessage.value = body['message']?.toString() ?? 'Impossible de créer la fiche';
      return false;
    } catch (e) {
      errorMessage.value = 'Erreur de connexion au serveur';
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  Future<bool> updateAdherent(String id, Map<String, dynamic> data) async {
    final clubId = _clubId;
    if (clubId == null) {
      errorMessage.value = 'Aucun club sélectionné';
      return false;
    }

    isSaving.value = true;
    errorMessage.value = '';
    try {
      final response = await ApiClient.patch(ApiConstants.adherentById(clubId, id), data);
      if (response.statusCode == 200) {
        await fetchAdherents();
        return true;
      }
      final body = jsonDecode(response.body);
      errorMessage.value = body['message']?.toString() ?? 'Impossible de modifier la fiche';
      return false;
    } catch (e) {
      errorMessage.value = 'Erreur de connexion au serveur';
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  Future<bool> deleteAdherent(String id) async {
    final clubId = _clubId;
    if (clubId == null) {
      errorMessage.value = 'Aucun club sélectionné';
      return false;
    }

    isSaving.value = true;
    errorMessage.value = '';
    try {
      final response = await ApiClient.delete(ApiConstants.adherentById(clubId, id));
      if (response.statusCode == 200) {
        adherents.removeWhere((a) => a.id == id);
        return true;
      }
      final body = jsonDecode(response.body);
      errorMessage.value = body['message']?.toString() ?? 'Impossible de supprimer';
      return false;
    } catch (e) {
      errorMessage.value = 'Erreur de connexion au serveur';
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  Future<bool> updateStatus(String id, String status) async {
    final clubId = _clubId;
    if (clubId == null) {
      errorMessage.value = 'Aucun club sélectionné';
      return false;
    }

    isSaving.value = true;
    errorMessage.value = '';
    try {
      final response = await ApiClient.patch(ApiConstants.adherentStatusById(clubId, id), {'status': status});
      if (response.statusCode == 200) {
        await fetchAdherents();
        return true;
      }
      final body = jsonDecode(response.body);
      errorMessage.value = body['message']?.toString() ?? 'Impossible de changer le statut';
      return false;
    } catch (e) {
      errorMessage.value = 'Erreur de connexion au serveur';
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  int get pendingCount => adherents.where((a) => a.status == 'SUBMITTED').length;

  List<AdherentModel> get filteredList {
    return adherents.where((a) {
      final matchesCategory =
          selectedCategory.value == 'Toutes' || a.ageCategory == selectedCategory.value;
      final matchesSearch =
          a.fullName.toLowerCase().contains(searchQuery.value.toLowerCase());
      final matchesStatus = switch (statusFilter.value) {
        'PENDING' => a.status == 'SUBMITTED',
        'VALIDATED' => a.status == 'VALIDATED',
        _ => true, // 'ALL'
      };
      return matchesCategory && matchesSearch && matchesStatus;
    }).toList();
  }
}